import { useState, useRef, useEffect } from 'react'
import classnames from 'classnames'
import { useSuiClient } from '@mysten/dapp-kit';
import lightBolt11Decoder from 'light-bolt11-decoder';
import type { SuiClient } from '@mysten/sui.js/client';
import { Loading } from './Loading'
import { VAULT_ID, SATS_DECIMALS, SUI_DECIMALS } from "./constants"
import { ListedItem } from './types'

import suiLogoPng from './assets/sui-logo.png'

function Marketplace() {
  const suiClient = useSuiClient()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ListedItem[]>([])

  useEffect(() => {
    setLoading(true)
    fetchMarketplaceItems(suiClient).then(listedItems => {
      setItems(listedItems)
      setLoading(false)
    })
  }, [])

  return (
    <section>
      { loading ? (
        <Loading />
      ) : items.length > 0 ? (
        <div className="container mx-auto flex items-center flex-wrap pt-4 pb-12">
          { items.map(item => (
            <Item key={item.id} item={item} />
          )) }
        </div>
      ) : (
        <p className='text-center'>No Items</p>
      ) }
    </section>
  )
}

export default Marketplace

async function fetchMarketplaceItems(suiClient: SuiClient): Promise<ListedItem[]> {
  const dynamicFields = await suiClient.getDynamicFields({
    parentId: VAULT_ID
  })

  const dynamicObjects = await Promise.all(dynamicFields.data.map(field => (
    suiClient.getDynamicFieldObject({
      parentId: VAULT_ID,
      name: {
        type: field.name.type,
        value: field.name.value,
      }
    })
  )))

  const listedItems = dynamicObjects.map(obj => obj.data?.content as any).flatMap(content => {
    try {
      const invoice = new TextDecoder().decode(new Uint8Array(content.fields.invoice))
      const price = parseFloat(
        lightBolt11Decoder.decode(invoice).sections.find((s: any) => s.name === 'amount').value
      ) / Math.pow(10, SATS_DECIMALS)

      const listing = {
        listingId: content.fields.id.id,
        invoice,
        price,
      }

      if (content.fields.obj.fields.balance) {
        return [{
          ...listing,

          id: content.fields.obj.fields.id.id,
          name: `${parseInt(content.fields.obj.fields.balance) / Math.pow(10, SUI_DECIMALS)} SUI`,
          imgUrl: suiLogoPng,
          type: content.fields.obj.type,
        }]
      }

      if (content.fields.obj.fields.name) {
        return [{
          ...listing,

          id: content.fields.obj.fields.id.id,
          name: content.fields.obj.fields.name,
          imgUrl: content.fields.obj.fields.img_url,
          type: content.fields.obj.type,
        }]
      }
    } catch (error) {
      console.warn(error, content)
    }
    return []
  })

  return listedItems
}

type BuyStep = 'init' | 'paid' | 'paid-claimed'
function Item({ item }: {
  item: ListedItem
}) {
  const buyModal = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<BuyStep>('init')

  return <>
    <div className="w-full md:w-1/3 xl:w-1/4 p-6 flex flex-col">
      <img className="hover:grow hover:shadow-lg cursor-pointer" src={item.imgUrl} onClick={() => { buyModal.current?.showModal() }} />
      <div className='flex justify-between pt-3'>
        <div className="">
          <p className="">{ item.name }</p>
          <p className="pt-1 text-gray-900">{ item.price } SATs</p>
        </div>
        <button
          className='inline-block px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-400'
          onClick={() => {
            buyModal.current?.showModal()
          }}
        >Buy</button>
      </div>
    </div>

    <dialog ref={buyModal} className="relative w-80 bg-white rounded-lg shadow max-w-screen-md">
      <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
        <h3 className="text-xl font-semibold text-gray-900">
          Buy
        </h3>
        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={() => buyModal.current?.close()}>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
      </div>
      <div className="flex flex-col items-stretch p-4 md:p-5 space-y-4">
        { step !== 'paid-claimed' ? <>
          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'init' ? 'bg-blue-600 hover:bg-blue-400' : 'bg-blue-200 cursor-not-allowed',
            )}
            onClick={step === 'init' ? () => {
              console.log('buy action WIP...')
              setStep('paid')
            } : undefined}
          >{ step === 'init' ? `Pay with ${item.price} SATs` : 'Paid' }</button>

          <hr />

          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'paid' ? 'bg-blue-600 hover:bg-blue-400' : 'bg-blue-200 cursor-not-allowed',
            )}
            onClick={() => {
              console.log('claim action WIP...')
              setStep('paid-claimed')
            }}
          >Claim on Sui</button>
        </> : <>
          <p>Done!</p>

          <button
            className='inline-block px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-400'
            onClick={() => {
              buyModal.current?.close()
            }}
          >Close</button>
        </> }

      </div>
    </dialog>
  </>
}

