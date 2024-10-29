'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField
} from '@mui/material'

const ReservationInformation = () => {
  const searchParams = useSearchParams()
  const idFromUrl = searchParams.get('id')
  const [addressData, setAddressData] = useState({})
  const [bookingResponse, setBookingResponse] = useState({})
  const [signsData, setSignsData] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchFilm, setSearchFilm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [bookingNumbers, setBookingNumbers] = useState([])
  const [selectedBookingNo, setSelectedBookingNo] = useState('')

  // New state to control the active tab
  const [activeTab, setActiveTab] = useState('address')

  // New states for dropdown data
  const [provinces, setProvinces] = useState([])
  const [amphurs, setAmphurs] = useState([])
  const [districts, setDistricts] = useState([])
  const [postcodes, setPostcodes] = useState([])

  const handleTabChange = tab => {
    setActiveTab(tab)
  }

  const fetchData = useCallback(async () => {
    if (!idFromUrl) {
      setAddressData({})
      setBookingResponse({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(`/api/reservation/address?id=${idFromUrl}`)
      console.log('API Response:', response.data)
      setAddressData(response.data.addressData || {})
      setSignsData(response.data.signsData || [])
      setFaculties(response.data.addressData.faculties || [])
      setSelectedFaculty(response.data.addressData.facid || '')
      setSearchFilm(response.data.addressData.film_no || '')

      const storedData = sessionStorage.getItem('resservationData')
      if (storedData) {
        const { booking_no } = JSON.parse(storedData)
        try {
          const bookingResponse = await axios.get(`/api/reservation/booking?id=${idFromUrl}&booking_no=${booking_no}`)
          console.log('Booking API Response:', bookingResponse.data)
          setBookingResponse(bookingResponse.data[0] || {})
        } catch (bookingError) {
          console.error('Failed to fetch booking data:', bookingError)
          setBookingResponse({})
        }
      }

      if (response.data.addressData.film_no) {
        const bookingNoResponse = await axios.get(
          `/api/reservation/bookings?film_no=${response.data.addressData.film_no}`
        )
        console.log('Booking Numbers:', bookingNoResponse.data.bookingNumbers)
        setBookingNumbers(bookingNoResponse.data.bookingNumbers || [])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [idFromUrl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch provinces data
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('/api/reservation/bookingaddress?type=province')
        setProvinces(response.data)
      } catch (error) {
        console.error('Failed to fetch provinces:', error)
      }
    }
    fetchProvinces()
  }, [])

  // Fetch amphurs based on selected province
  useEffect(() => {
    if (!bookingResponse.province) {
      setAmphurs([])
      setDistricts([])
      setPostcodes([])
      return
    }
    const fetchAmphurs = async () => {
      try {
        const response = await axios.get(`/api/reservation/bookingaddress?type=amphur&id=${bookingResponse.province}`)
        setAmphurs(response.data)
      } catch (error) {
        console.error('Failed to fetch amphurs:', error)
      }
    }
    fetchAmphurs()
  }, [bookingResponse.province])

  // Fetch districts based on selected amphur
  useEffect(() => {
    if (!bookingResponse.amphur) {
      setDistricts([])
      setPostcodes([])
      return
    }
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`/api/reservation/bookingaddress?type=district&id=${bookingResponse.amphur}`)
        setDistricts(response.data)
      } catch (error) {
        console.error('Failed to fetch districts:', error)
      }
    }
    fetchDistricts()
  }, [bookingResponse.amphur])

  // Fetch postcodes based on selected district
  useEffect(() => {
    if (!bookingResponse.tumbol) {
      setPostcodes([])
      return
    }
    const fetchPostcodes = async () => {
      try {
        const response = await axios.get(`/api/reservation/bookingaddress?type=postcode&id=${bookingResponse.amphur}`)
        setPostcodes(response.data)
      } catch (error) {
        console.error('Failed to fetch postcodes:', error)
      }
    }
    fetchPostcodes()
  }, [bookingResponse.tumbol])

  const handleAddressChange = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }))
  }

  const handleBookingChange = (field, value) => {
    if (field === 'province') {
      setBookingResponse(prev => ({ ...prev, [field]: value, amphur: '', tumbol: '', zip: '' }))
    } else if (field === 'amphur') {
      setBookingResponse(prev => ({ ...prev, [field]: value, tumbol: '', zip: '' }))
    } else if (field === 'tumbol') {
      setBookingResponse(prev => ({ ...prev, [field]: value, zip: '' }))
    } else {
      setBookingResponse(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSearch = () => {
    console.log('Searching for:', searchFilm)
  }

  const handleBookingNoChange = event => {
    setSelectedBookingNo(event.target.value)
    handleBookingChange('booking_no', event.target.value)
  }

  const handleLogData = () => {
    console.log('Address Data:', addressData)
    console.log('Booking Response:', bookingResponse)
  }

  const renderAddressForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>Search Film</InputLabel>
            <OutlinedInput
              value={searchFilm}
              onChange={e => setSearchFilm(e.target.value)}
              endAdornment={
                <Button variant='contained' onClick={handleSearch}>
                  Search
                </Button>
              }
              label='Search Film'
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant='outlined'>
            <InputLabel>คำนำหน้าชื่อ</InputLabel>
            <Select
              value={addressData.signs_id || ''}
              onChange={e => handleAddressChange('signs_id', e.target.value)}
              label='คำนำหน้าชื่อ'
            >
              {signsData.map(sign => (
                <MenuItem key={sign.id} value={sign.id}>
                  {sign.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='ชื่อ (ผู้รับปริญญา)'
            value={addressData.fname || ''}
            onChange={e => handleAddressChange('fname', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='สกุล'
            value={addressData.lname || ''}
            onChange={e => handleAddressChange('lname', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>ปริญญา</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={addressData.educ1 === 'Y'}
                onChange={e => handleAddressChange('educ1', e.target.checked ? 'Y' : 'N')}
              />
            }
            label='ตรี'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={addressData.educ2 === 'Y'}
                onChange={e => handleAddressChange('educ2', e.target.checked ? 'Y' : 'N')}
              />
            }
            label='โท'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={addressData.educ3 === 'Y'}
                onChange={e => handleAddressChange('educ3', e.target.checked ? 'Y' : 'N')}
              />
            }
            label='เอก'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={addressData.educ4 === 'Y'}
                onChange={e => handleAddressChange('educ4', e.target.checked ? 'Y' : 'N')}
              />
            }
            label='อื่นๆ'
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>คณะ</InputLabel>
            <Select
              value={selectedFaculty}
              onChange={e => {
                setSelectedFaculty(e.target.value)
                handleAddressChange('facid', e.target.value)
              }}
              label='คณะ'
            >
              {faculties.map(faculty => (
                <MenuItem key={faculty.facid} value={faculty.facid}>
                  {faculty.facuname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='เบอร์โทร'
            value={addressData.tel || ''}
            onChange={e => handleAddressChange('tel', e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography className='mb-2'>ตำแหน่งรูปหมู่</Typography>
          <Grid container spacing={1}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <Grid item xs={4} key={num}>
                <TextField
                  fullWidth
                  label={`ตำแหน่ง ${num}`}
                  value={addressData[`posiphoto_${num}`] || ''}
                  onChange={e => handleAddressChange(`posiphoto_${num}`, e.target.value)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleLogData} variant='contained' color='primary' fullWidth>
            Log Data
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )

  const renderBookingForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant='h5' gutterBottom>
        ข้อมูลการจอง
      </Typography>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='ชื่อผู้จอง'
              value={bookingResponse.name_for_rec || ''}
              onChange={e => handleBookingChange('name_for_rec', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label='บ้านเลขที่/หมู่บ้าน'
              value={bookingResponse.addno || ''}
              onChange={e => handleBookingChange('addno', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='หมู่ที่'
              value={bookingResponse.moo || ''}
              onChange={e => handleBookingChange('moo', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='ซอย'
              value={bookingResponse.soi || ''}
              onChange={e => handleBookingChange('soi', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='ถนน'
              value={bookingResponse.road || ''}
              onChange={e => handleBookingChange('road', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>จังหวัด</InputLabel>
              <Select
                value={bookingResponse.province || ''}
                onChange={e => handleBookingChange('province', e.target.value)}
                label='จังหวัด'
              >
                {provinces.map(province => (
                  <MenuItem key={province.PROVINCE_ID} value={province.PROVINCE_ID}>
                    {province.PROVINCE_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.province}>
              <InputLabel>อำเภอ</InputLabel>
              <Select
                value={bookingResponse.amphur || ''}
                onChange={e => handleBookingChange('amphur', e.target.value)}
                label='อำเภอ'
              >
                {amphurs.map(amphur => (
                  <MenuItem key={amphur.AMPHUR_ID} value={amphur.AMPHUR_ID}>
                    {amphur.AMPHUR_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.amphur}>
              <InputLabel>ตำบล</InputLabel>
              <Select
                value={bookingResponse.tumbol || ''}
                onChange={e => handleBookingChange('tumbol', e.target.value)}
                label='ตำบล'
              >
                {districts.map(district => (
                  <MenuItem key={district.DISTRICT_ID} value={district.DISTRICT_ID}>
                    {district.DISTRICT_NAME}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth disabled={!bookingResponse.tumbol}>
              <InputLabel>รหัสไปรษณีย์</InputLabel>
              <Select
                value={bookingResponse.zip || ''}
                onChange={e => handleBookingChange('zip', e.target.value)}
                label='รหัสไปรษณีย์'
              >
                {postcodes.map(postcode => (
                  <MenuItem key={postcode.POST_CODE} value={postcode.POST_CODE}>
                    {postcode.POST_CODE}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Email'
              value={bookingResponse.email || ''}
              onChange={e => handleBookingChange('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Line'
              value={bookingResponse.lineid || ''}
              onChange={e => handleBookingChange('line', e.target.value)}
            />
          </Grid>
        </Grid>
      </form>
    </Paper>
  )

  const renderTopControls = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Grid container spacing={2} alignItems='center'>
        <Grid item>
          <Button
            variant={activeTab === 'address' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('address')}
          >
            ที่อยู่สำหรับจัดส่ง
          </Button>
        </Grid>
        <Grid item>
          <Button variant={activeTab === 'set' ? 'contained' : 'outlined'} onClick={() => handleTabChange('set')}>
            แบบชุด
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={activeTab === 'additional' ? 'contained' : 'outlined'}
            onClick={() => handleTabChange('additional')}
          >
            เพิ่มเติม
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl fullWidth variant='outlined' sx={{ flexGrow: 1, marginRight: '10px' }}>
              <InputLabel>เลขใบจอง</InputLabel>
              <Select
                value={bookingResponse.booking_no || ''}
                onChange={e => handleBookingNoChange(e.target.value)}
                label='เลขใบจอง'
              >
                <MenuItem value={bookingResponse.booking_no}>{bookingResponse.booking_no}</MenuItem>
              </Select>
            </FormControl>
            <Button variant='contained' color='primary'>
              เพิ่มใบจอง
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography variant='h6' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', margin: 'auto', mt: 4 }}>
      {renderTopControls()}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {renderAddressForm()}
        </Grid>
        <Grid item xs={12} md={6}>
          {activeTab === 'address' && renderBookingForm()}
          {activeTab === 'set' && (
            <Box>
              <Typography>เนื้อหาในแท็บแบบชุด</Typography>
            </Box>
          )}
          {activeTab === 'additional' && (
            <Box>
              <Typography>เนื้อหาในแท็บเพิ่มเติม</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReservationInformation
