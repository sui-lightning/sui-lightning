#[test_only]
module sui_lightning::test_nft {

    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct TestNFT has key, store {
      id: UID
    }

    public fun mint(ctx: &mut TxContext): TestNFT {
      let nft = TestNFT {
        id: object::new(ctx),
      };
      nft
    }

    public fun burn(nft: TestNFT) {
      let TestNFT { id } = nft;
      object::delete(id);
    }

}