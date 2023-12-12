import { useState } from 'react'
import classnames from 'classnames'
import { useAutoConnectWallet } from '@mysten/dapp-kit';
import Marketplace from './Marketplace'
import Listing from './Listing'

import logoPng from './assets/logo.png'

import './App.css'

type Tab = 'marketplace' | 'listing'

function App() {
  const [tab, setTab] = useState<Tab>('marketplace')
  useAutoConnectWallet();

  return (
    <>
      <nav className="p-6">
        <div className='flex justify-center items-center gap-4 pb-4'>
          <img src={logoPng} className='h-24' />
          <h1 className='text-4xl italic'>Sui 🤝 Lightning</h1>
        </div>
        <ul className="flex justify-center text-sm font-medium text-center">
          <li className="me-2">
            <button
              className={classnames(
                'inline-block px-4 py-3 rounded-lg',
                tab === 'marketplace' ? 'text-white bg-blue-600' : 'hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={() => setTab('marketplace')}
            >Marketplace</button>
          </li>
          <li className="me-2">
            <button
              className={classnames(
                'inline-block px-4 py-3 rounded-lg',
                tab === 'listing' ? 'text-white bg-green-600' : 'hover:text-gray-900 hover:bg-gray-100'
              )}
              onClick={() => setTab('listing')}
            >Listing</button>
          </li>
        </ul>
      </nav>

      { tab === 'marketplace' && <Marketplace />}
      { tab === 'listing' && <Listing />}

    </>
  )
}

export default App
