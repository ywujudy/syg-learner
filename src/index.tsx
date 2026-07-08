import Loading from './components/Loading'
import './index.css'
import DonatePage from './pages/Donate'
import { ErrorBook } from './pages/ErrorBook'
import ExamPage from './pages/Exam'
import ExamALevelPage from './pages/Exam/ALevel'
import ExamEdxMathPage from './pages/Exam/EdxMath'
import { FriendLinks } from './pages/FriendLinks'
import HomePage from './pages/Home'
import MobilePage from './pages/Mobile'
import RoomBookingPage from './pages/RoomBooking'
import SettingsPage from './pages/Settings'
import TreeHolePage from './pages/TreeHole'
import TreeHoleDetailPage from './pages/TreeHole/Detail'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { authUserAtom } from '@/store/authAtom'
import { reloadCustomDictionariesAtom } from '@/store/customDictAtom'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import { useAtomValue, useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))

if (process.env.NODE_ENV === 'production') {
  // for prod
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  // for dev
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const authUser = useAtomValue(authUserAtom)
  const reloadCustomDicts = useSetAtom(reloadCustomDictionariesAtom)

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    reloadCustomDicts()
  }, [authUser, reloadCustomDicts])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 600
      if (!isMobile) {
        window.location.href = '/'
      }
      setIsMobile(isMobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {isMobile ? (
              <Route path="/*" element={<Navigate to="/mobile" />} />
            ) : (
              <>
                <Route index element={<HomePage />} />
                <Route path="/typing" element={<TypingPage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/exam" element={<ExamPage />} />
                <Route path="/exam/alevel" element={<ExamALevelPage />} />
                <Route path="/exam/alevel/edx/math" element={<ExamEdxMathPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/error-book" element={<ErrorBook />} />
                <Route path="/friend-links" element={<FriendLinks />} />
                <Route path="/tree-hole" element={<TreeHolePage />} />
                <Route path="/tree-hole/:id" element={<TreeHoleDetailPage />} />
                <Route path="/room-booking" element={<RoomBookingPage />} />
                <Route path="/*" element={<Navigate to="/" />} />
              </>
            )}
            <Route path="/mobile" element={<MobilePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
