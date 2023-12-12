module sui_lightning::object_lock {

    // Imports
    use std::string::{String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_object_field as ofield;

    struct ObjectLockVault has key, store {
        id: UID,
        locked_object_count: u64
    }

    struct LockedObjectWrapper<Obj: key + store> has key, store {
        id: UID,
        owner: address,
        obj: Obj,
        invoice: String
    }

    fun init(ctx: &mut TxContext) {
        let vault = ObjectLockVault {
            id: object::new(ctx),
            locked_object_count: 0
        };
        transfer::share_object(vault);
    }

    // This function is called by the object seller to lock the object with a payment hash
    // The payment hash is reveal once a lightning invoice is created
    public entry fun lock_with_hash<Obj: key + store>(
        vault: &mut ObjectLockVault,
        hash: vector<u8>,
        obj: Obj,
        invoice: String,
        ctx: &mut TxContext
    ) {
        let obj_wrapper = LockedObjectWrapper {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            obj: obj,
            invoice: invoice
        };
        ofield::add(&mut vault.id, hash, obj_wrapper);
    }

    // This function is called by the object buyer to unlock the object and retain its ownership
    // To unlock such object, the buyer must provide the preimage of the payment hash
    #[lint_allow(self_transfer)]
    public entry fun unlock_with_preimage<Obj: key + store>(
        vault: &mut ObjectLockVault,
        hash: vector<u8>,
        _preimage: vector<u8>,
        ctx: &mut TxContext
    ) {
        // TODO: add sha256 preimage verification
        let obj = ofield::remove<vector<u8>, Obj>(&mut vault.id, hash);
        transfer::public_transfer(obj, tx_context::sender(ctx))
    }

}