#[test_only]
module sui_lightning::object_lock_test {

    use sui::test_scenario::{Self, ctx, Scenario};

    use std::string::{utf8};
    use sui_lightning::object_lock::{Self, ObjectLockVault};
    use sui_lightning::test_nft::{Self, TestNFT};
    use std::debug;

    const TEST_SENDER: address = @0xAABB;

    #[test]
    fun test_object_lock_and_unlock() {

        let scenario = test_scenario::begin(TEST_SENDER);

        object_lock::test_init(ctx(&mut scenario));

        test_scenario::next_tx(&mut scenario, TEST_SENDER);

        // get nft from test_nft
        
        let vault = test_scenario::take_shared<ObjectLockVault>(&scenario);

        let nft = test_nft::mint(ctx(&mut scenario));
        // test_nft::burn(nft);

        test_scenario::next_tx(&mut scenario, TEST_SENDER);

        debug::print(&utf8(b"init_scenario"));

        // Preimage f4c78c611c3e204b1a339dd68f64b80b5937317545794afa80f9f19a05720a79
        // Payment Hash babbd1464e762ee3f9377575b95fc2abb1af30ffb132d5d1be320924a948cba6
        object_lock::lock_with_hash(
            &mut vault,
            x"babbd1464e762ee3f9377575b95fc2abb1af30ffb132d5d1be320924a948cba6",
            nft,
            b"test invoice",
            ctx(&mut scenario),
        );

        test_scenario::next_tx(&mut scenario, TEST_SENDER);

        debug::print(&vault);


        let nft_unlocked = object_lock::unlock_with_preimage<TestNFT>(
            &mut vault,
            x"babbd1464e762ee3f9377575b95fc2abb1af30ffb132d5d1be320924a948cba6",
            x"f4c78c611c3e204b1a339dd68f64b80b5937317545794afa80f9f19a05720a79",
            ctx(&mut scenario),
        );

        test_nft::burn(nft_unlocked);
        test_scenario::next_tx(&mut scenario, TEST_SENDER);

        debug::print(&vault);

        test_scenario::return_shared(vault);
        test_scenario::end(scenario);

    }
}
