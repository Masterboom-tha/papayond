'use client'
import { useState, useEffect } from 'react'

export default function AddressForm() {
  const [provinces, setProvinces] = useState([])
  const [amphurs, setAmphurs] = useState([])
  const [districts, setDistricts] = useState([])
  const [postcodes, setPostcodes] = useState([])

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedAmphur, setSelectedAmphur] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [postcode, setPostcode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProvinces()
  }, [])

  const fetchProvinces = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/address/provinces')
      const data = await res.json()

      setProvinces(data)
    } catch (err) {
      console.error('Error fetching provinces:', err)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลจังหวัด')
    } finally {
      setLoading(false)
    }
  }

  const handleProvinceChange = async e => {
    const provinceId = e.target.value

    setSelectedProvince(provinceId)
    setSelectedAmphur('')
    setSelectedDistrict('')
    setPostcode('')

    if (provinceId) {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/address/amphurs?id=${provinceId}`)
        const data = await res.json()

        setAmphurs(data)
      } catch (err) {
        console.error('Error fetching amphurs:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลอำเภอ')
      } finally {
        setLoading(false)
      }
    } else {
      setAmphurs([])
      setDistricts([])
      setPostcodes([])
    }
  }

  const handleAmphurChange = async e => {
    const amphurId = e.target.value

    setSelectedAmphur(amphurId)
    setSelectedDistrict('')
    setPostcode('')

    if (amphurId) {
      setLoading(true)
      setError(null)

      try {
        const [districtsRes, postcodesRes] = await Promise.all([
          fetch(`/api/address/districts?id=${amphurId}`),
          fetch(`/api/address/postcodes?id=${amphurId}`)
        ])

        const districtsData = await districtsRes.json()
        const postcodesData = await postcodesRes.json()

        setDistricts(districtsData)
        setPostcodes(postcodesData)

        if (postcodesData.length === 1) {
          setPostcode(postcodesData[0].postCode)
        }
      } catch (err) {
        console.error('Error fetching districts or postcodes:', err)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลตำบลหรือรหัสไปรษณีย์')
      } finally {
        setLoading(false)
      }
    } else {
      setDistricts([])
      setPostcodes([])
    }
  }

  const handleDistrictChange = e => {
    setSelectedDistrict(e.target.value)
  }

  return (
    <div>
      {loading && <p>กำลังโหลด...</p>}
      {error && <p className='text-danger'>{error}</p>}
      <div className='row m-auto'>
        <div className='col-lg-6 col-sm-12 m-auto'>
          <label className='form-label'>
            จังหวัด <span className='weight-300'> (Province) </span> <span className='text-danger'>*</span>
          </label>
          <select className='form-control' value={selectedProvince} onChange={handleProvinceChange}>
            <option value=''>เลือกจังหวัด</option>
            {provinces.map(province => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='row m-auto'>
        <div className='col-lg-6 col-sm-12 m-auto'>
          <label className='form-label'>
            อำเภอ <span className='weight-300'> (Amphur) </span> <span className='text-danger'>*</span>
          </label>
          <select className='form-control' value={selectedAmphur} onChange={handleAmphurChange}>
            <option value=''>เลือกอำเภอ</option>
            {amphurs.map(amphur => (
              <option key={amphur.id} value={amphur.id}>
                {amphur.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='row m-auto'>
        <div className='col-lg-6 col-sm-12 m-auto'>
          <label className='form-label'>
            ตำบล <span className='weight-300'> (District) </span> <span className='text-danger'>*</span>
          </label>
          <select className='form-control' value={selectedDistrict} onChange={handleDistrictChange}>
            <option value=''>เลือกตำบล</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='row m-auto'>
        <div className='col-lg-6 col-sm-12 m-auto'>
          <label className='form-label'>
            รหัสไปรษณีย์ <span className='weight-300'> (Postcode) </span> <span className='text-danger'>*</span>
          </label>
          <input type='text' className='form-control' value={postcode} readOnly />
        </div>
      </div>
    </div>
  )
}
