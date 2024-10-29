'use client'

// Third-party Imports
import classnames from 'classnames'
import { useEffect, useState } from 'react'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import useSessionStorage from './useSessionStorage' // Import custom hook

const NavbarContent = () => {
  const [universityData, setUniversityData] = useSessionStorage('selectedUniversity', null)
  const [isClient, setIsClient] = useState(false)
  const [universityInfo, setUniversityInfo] = useState(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // อัปเดตข้อมูลมหาวิทยาลัยเมื่อ universityData เปลี่ยนแปลง
    if (universityData) {
      setUniversityInfo(`${universityData.uni_id}-${universityData.uniname} ปีการศึกษา ${universityData.uni_year}`)
    } else {
      setUniversityInfo(null)
    }
  }, [universityData])

  const renderUniversityInfo = () => {
    if (!isClient) {
      return <div className='text-lg font-semibold text-gray-500'>กรุณาเลือกมหาวิทยาลัย</div>
    }

    if (universityInfo) {
      return <div className='text-lg font-semibold'>{universityInfo}</div>
    } else {
      return <div className='text-lg font-semibold text-gray-500'>กรุณาเลือกมหาวิทยาลัย</div>
    }
  }

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        {renderUniversityInfo()}
      </div>
      <div className='flex items-center gap-4'>
        <ModeDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
