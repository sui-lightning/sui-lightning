import { useState, useRef, useEffect } from 'react'
import classnames from 'classnames'
import { useSuiClient, useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';
import { requestProvider } from "webln";
import { Loading } from './Loading'
import { Item } from './types'
import suiLogoPng from './assets/sui-logo.png'

function Listing() {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const [loading, setLoading] = useState(false)
  const [nftItems, setNftItems] = useState<Item[]>([])

  useEffect(() => {
    if (!account) return

    setLoading(true)

    suiClient.getOwnedObjects({
      owner: account.address,
      options: { showContent: true },
    }).then(objects => {
      const balance = objects.data.map(o => o.data?.content as any).map(
        content => content.fields.balance
      ).reduce((acc, cur) => cur ? (acc + parseInt(cur) / Math.pow(10, 9)) : acc, 0)

      const balanceItem = {
        id: 'balance',
        name: `Balance: ${balance}`,
        imgUrl: suiLogoPng,
        listable: false,
      }

      const nftItems = objects.data.map(o => o.data?.content as any).map(content => {
        return {
          id: content.fields.id.id,
          name: content.fields.name,
          imgUrl: content.fields.img_url,
          listable: true,
        }
      }).filter(i => i.name)

      setNftItems([balanceItem, ...nftItems])
      setLoading(false)
    });
  }, [account])

  if (!account) {
    return (
      <section className="flex justify-center py-8">
        <ConnectButton style={{ background: 'black', color: 'white' }} />
      </section>
    )
  }

  return <>
    <section className="py-8">
      { loading ? (
        <Loading />
      ) : nftItems.length > 0 ? (
        <div className="container mx-auto flex items-center flex-wrap pt-4 pb-12">
          { nftItems.map(item => (
            <NftItem key={item.id} item={item} />
          )) }
        </div>
      ) : (
        <p className='text-center'>No NFT</p>
      ) }
    </section>
  </>
}

export default Listing

type ListingStep = 'init' | 'invoice-created' | 'listed'

function NftItem({ item }: {
  item: Item
}) {
  const listingModal = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<ListingStep>('init')
  const [price, setPrice] = useState("")
  const [/* invoice */, setInvoice] = useState<any>()

  const listed = typeof item.price === 'number'

  return <>
    <div className="w-full md:w-1/3 xl:w-1/4 p-6 flex flex-col">
      { item.listable && !listed ? (
        <img className='hover:grow hover:shadow-lg cursor-pointer' src={item.imgUrl} onClick={() => { listingModal.current?.showModal() }} />
      ) : (
        <img src={item.imgUrl} />
      ) }
      <div className='flex justify-between pt-3'>
        <div className="">
          <p className="">{ item.name }</p>
          { item.listable && listed && (
            <p className="pt-1 text-gray-900">{ item.price }</p>
          ) }
        </div>
        {item.listable && (
          <button
            className={classnames(
              'inline-block px-4 py-3 rounded-lg text-white',
              listed ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
            )}
            onClick={() => {
              listingModal.current?.showModal()
            }}
            disabled={listed}
          >{ listed ? 'Listed' : 'List' }</button>
        )}
      </div>
    </div>

    <dialog ref={listingModal} className="relative w-80 rounded-lg shadow max-w-screen-md">
      <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
        <h3 className="text-xl font-semibold text-gray-900">
          Listing
        </h3>
        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={() => {
          listingModal.current?.close()
        }}>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
      </div>
      <div className="flex flex-col items-stretch p-4 md:p-5 space-y-4">
        { step !== 'listed' ? <>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">Price</label>
            <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5" placeholder="123.45" disabled={step !== 'init'} value={price} onChange={(event) => setPrice(event.target.value)}/>
          </div>

          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'init' ? 'bg-green-600 hover:bg-green-400' : 'bg-green-200 cursor-not-allowed',
            )}
            onClick={step === 'init' ? async () => {
              try {
                const webln = await requestProvider();
                const res = await webln.makeInvoice({ amount: price })
                setInvoice(res)
                setStep('invoice-created')
                // Now you can call all of the webln.* methods
              } catch (err:any) {
                // Tell the user what went wrong
                alert(err.message);
              }
            } : undefined}
          >Create Invoice</button>

          <hr />

          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'invoice-created' ? 'bg-green-600 hover:bg-green-400' : 'bg-green-200 cursor-not-allowed',
            )}
            onClick={() => {
              console.log('listing on Sui action WIP...')
              setStep('listed')
            }}
          >List on Sui</button>
        </> : <>
            <p>Done!</p>

            <button
              className='inline-block px-4 py-3 rounded-lg text-white bg-green-600 hover:bg-green-400'
              onClick={() => {
                listingModal.current?.close()
              }}
            >Close</button>
          </> }
      </div>
    </dialog>
  </>
}

