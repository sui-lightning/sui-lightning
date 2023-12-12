import { useState, useRef } from 'react'
import classnames from 'classnames'
import demoItemAvif from './assets/demo-item.avif'

function Marketplace() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto flex items-center flex-wrap pt-4 pb-12">
        <Item name='Hello' price={123.45}/>
        <Item name='World' price={54.321}/>
        <Item name='Asdf' price={123.45}/>
      </div>
    </section>
  )
}

export default Marketplace

type BuyStep = 'init' | 'paid' | 'paid-claimed'
function Item({ name, price }: {
  name: string
  price: number
}) {
  const buyModal = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState<BuyStep>('init')

  return <>
    <div className="w-full md:w-1/3 xl:w-1/4 p-6 flex flex-col">
      <img className="hover:grow hover:shadow-lg cursor-pointer" src={demoItemAvif} onClick={() => { buyModal.current?.showModal() }} />
      <div className='flex justify-between pt-3'>
        <div className="">
          <p className="">{ name }</p>
          <p className="pt-1 text-gray-900">{ price }</p>
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
          >{ step === 'init' ? `Pay with ${price} SATs` : 'Paid' }</button>

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

