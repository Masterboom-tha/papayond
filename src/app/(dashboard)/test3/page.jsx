'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AddressSelector = () => {
  const [provinces, setProvinces] = useState([])
  const [amphurs, setAmphurs] = useState([])
  const [districts, setDistricts] = useState([])
  const [postcode, setPostcode] = useState('')

  const [selectedProvince, setSelectedProvince] = useState(null)
  const [selectedAmphur, setSelectedAmphur] = useState(null)
  const [selectedDistrict, setSelectedDistrict] = useState(null)

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces()
  }, [])

  // Fetch amphurs when a province is selected
  useEffect(() => {
    if (selectedProvince) {
      fetchAmphurs(selectedProvince)
      setDistricts([]) // Clear districts when province changes
      setPostcode('') // Clear postcode when province changes
    }
  }, [selectedProvince])

  // Fetch districts when an amphur is selected
  useEffect(() => {
    if (selectedAmphur) {
      fetchDistricts(selectedAmphur)
      setPostcode('') // Clear postcode when amphur changes
    }
  }, [selectedAmphur])

  // Fetch postcode when a district is selected
  useEffect(() => {
    if (selectedAmphur) {
      fetchPostcode(selectedAmphur)
    }
  }, [selectedAmphur])

  // Fetch all provinces
  const fetchProvinces = async () => {
    try {
      const response = await axios.get('/api/reservation/bookingaddress?type=province')
      setProvinces(response.data)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  // Fetch amphurs based on selected province
  const fetchAmphurs = async provinceId => {
    try {
      const response = await axios.get(`/api/reservation/bookingaddress?type=amphur&id=${provinceId}`)
      setAmphurs(response.data)
    } catch (error) {
      console.error('Error fetching amphurs:', error)
    }
  }

  // Fetch districts based on selected amphur
  const fetchDistricts = async amphurId => {
    try {
      const response = await axios.get(`/api/reservation/bookingaddress?type=district&id=${amphurId}`)
      setDistricts(response.data)
    } catch (error) {
      console.error('Error fetching districts:', error)
    }
  }

  // Fetch postcode based on selected amphur
  const fetchPostcode = async amphurId => {
    try {
      const response = await axios.get(`/api/reservation/bookingaddress?type=postcode&id=${amphurId}`)
      setPostcode(response.data.length > 0 ? response.data[0].POST_CODE : '')
    } catch (error) {
      console.error('Error fetching postcode:', error)
    }
  }

  return (
    <div>
      <h2>Address Selector</h2>
      <div>
        <label>Province:</label>
        <select value={selectedProvince || ''} onChange={e => setSelectedProvince(e.target.value)}>
          <option value=''>Select Province</option>
          {provinces.map(province => (
            <option key={province.PROVINCE_ID} value={province.PROVINCE_ID}>
              {province.PROVINCE_NAME}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Amphur:</label>
        <select
          value={selectedAmphur || ''}
          onChange={e => setSelectedAmphur(e.target.value)}
          disabled={!selectedProvince}
        >
          <option value=''>Select Amphur</option>
          {amphurs.map(amphur => (
            <option key={amphur.AMPHUR_ID} value={amphur.AMPHUR_ID}>
              {amphur.AMPHUR_NAME}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>District:</label>
        <select
          value={selectedDistrict || ''}
          onChange={e => setSelectedDistrict(e.target.value)}
          disabled={!selectedAmphur}
        >
          <option value=''>Select District</option>
          {districts.map(district => (
            <option key={district.DISTRICT_ID} value={district.DISTRICT_ID}>
              {district.DISTRICT_NAME}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Postcode:</label>
        <input type='text' value={postcode} readOnly />
      </div>
    </div>
  )
}

export default AddressSelector
