export interface Item {
  id: string
  name: string
  imgUrl: string

  /**
  * present if listed
  */
  price?: number
  listable: boolean
  type: string
}
