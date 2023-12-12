import { useState, useRef } from 'react'
import classnames from 'classnames'

function Listing() {
  return <>
    <section className="bg-white py-8">
      <div className="container mx-auto flex items-center flex-wrap pt-4 pb-12">
        <NftItem name='My NFT 1' listedPrice={123.45} />
        <NftItem name='My NFT 2' />
      </div>
    </section>
  </>
}

export default Listing

type ListingStep = 'init' | 'invoice-created' | 'listed'

function NftItem({ name, listedPrice }: {
  name: string
  listedPrice?: number
}) {
  const listingModal = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<ListingStep>('init')

  const listed = typeof listedPrice === 'number'

  return <>
    <div className="w-full md:w-1/3 xl:w-1/4 p-6 flex flex-col">
      <img className="hover:grow hover:shadow-lg cursor-pointer" src="/demo-item.avif" onClick={() => { listingModal.current?.showModal() }} />
      <div className='flex justify-between pt-3'>
        <div className="">
          <p className="">{ name }</p>
          { listed && (
            <p className="pt-1 text-gray-900">{ listedPrice }</p>
          ) }
        </div>
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
      </div>
    </div>

    <dialog ref={listingModal} className="relative w-80 bg-white rounded-lg shadow max-w-screen-md">
      <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
        <h3 className="text-xl font-semibold text-gray-900">
          Listing
        </h3>
        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={() => {
          listingModal.current?.close()
          if (step === 'listed') {
            setStep('init')
          }
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
            <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="123.45" disabled={step !== 'init'} />
          </div>

          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'init' ? 'bg-blue-600 hover:bg-blue-400' : 'bg-blue-200 cursor-not-allowed',
            )}
            onClick={step === 'init' ? () => {
              console.log('creating invoice action WIP...')
              setStep('invoice-created')
            } : undefined}
          >Create Invoice</button>

          <hr />

          <button
            className={classnames(
              'inline-block px-8 py-3 rounded-lg text-white',
              step === 'invoice-created' ? 'bg-blue-600 hover:bg-blue-400' : 'bg-blue-200 cursor-not-allowed',
            )}
            onClick={() => {
              console.log('listing on Sui action WIP...')
              setStep('listed')
            }}
          >List on Sui</button>
        </> : <>
            <p>Done!</p>

            <button
              className='inline-block px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-400'
              onClick={() => {
                listingModal.current?.close()
                setStep('init')
              }}
            >Close</button>
          </> }
      </div>
    </dialog>
  </>
}

