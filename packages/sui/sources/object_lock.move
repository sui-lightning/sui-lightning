module sui_lightning::object_lock {

    // Imports
    // use std::string::{String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::dynamic_object_field as ofield;
    use std::hash::sha2_256 as sha2_256;

    struct ObjectLockVault has key, store {
        id: UID,
        locked_object_count: u64
    }

    struct LockedObjectWrapper<Obj: key + store> has key, store {
        id: UID,
        owner: address,
        obj: Obj,
        invoice: vector<u8>
    }

    fun init(ctx: &mut TxContext) {
        let vault = ObjectLockVault {
            id: object::new(ctx),
            locked_object_count: 0
        };
        transfer::share_object(vault);
    }


    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
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
        invoice: vector<u8>,
        ctx: &mut TxContext
    ) {
        let obj_wrapper = LockedObjectWrapper {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            obj: obj,
            invoice: invoice
        };
        ofield::add(&mut vault.id, hash, obj_wrapper);
        vault.locked_object_count = vault.locked_object_count + 1;
    }

    // This function is called by the object buyer to unlock the object and retain its ownership
    // To unlock such object, the buyer must provide the preimage of the payment hash
    // #[lint_allow(self_transfer)]
    public fun unlock_with_preimage<Obj: key + store>(
        vault: &mut ObjectLockVault,
        hash: vector<u8>,
        preimage: vector<u8>,
        _ctx: &mut TxContext
    ): Obj {
        // TODO: add sha256 preimage verification
        assert!(sha2_256(preimage) == hash, 999);
        let obj_wrapper = ofield::remove<vector<u8>, LockedObjectWrapper<Obj>>(&mut vault.id, hash);
        let LockedObjectWrapper { id, owner: _, obj, invoice: _ } = obj_wrapper;
        object::delete(id);

        vault.locked_object_count = vault.locked_object_count - 1;

        obj
        // obj
        // transfer::public_transfer(obj, tx_context::sender(ctx))
    }

}