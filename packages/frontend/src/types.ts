export interface Item {
  id: string
  name: string
  imgUrl: string

  /**
  * present if listed
  */
  price?: number
  type: string
}

export interface ListedItem extends Item {
  listingId: string
  invoice: string
}
