'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { getSession } from 'next-auth/react'
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
  TextField,
  Alert,
  Snackbar,
  Divider
} from '@mui/material'
import PhotoIcon from '@mui/icons-material/Photo' // ไอคอนสำหรับเพิ่มภาพหมู่
import ColorLensIcon from '@mui/icons-material/ColorLens' // ไอคอนสำหรับเปลี่ยนสีกรอบ

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
  const [openSnackbar, setOpenSnackbar] = useState(false) // สถานะการเปิด Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('') // ข้อความ Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success') // ระดับการแจ้งเตือน
  const [isAddingNewBooking, setIsAddingNewBooking] = useState(false) // state สำหรับการเพิ่มใบจองใหม่
  const [newBookingNo, setNewBookingNo] = useState('')

  const [sets, setSets] = useState(
    Array.from({ length: 15 }, (_, index) => ({
      name: `ชุดที่ ${index + 1}`,
      quantity: 0,
      addon1: false,
      addon2: false,
      disabled: true // เริ่มต้นด้วย disabled ทั้งหมด
    }))
  )

  useEffect(() => {
    const fetchGroupData = async () => {
      const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))
      const uni_id = selectedUniversity?.uni_id

      if (!uni_id) return // Early return if uni_id is not available

      try {
        const response = await axios.post('/api/pricegroup', { uni_id })
        const groupData = response.data

        // Update sets based on groupData
        const updatedSets = sets.map((set, index) => {
          const group = groupData.find(g => g.group_id === index + 1)
          return {
            ...set,
            disabled: !group || group.group_active !== 1 // Disable if no group or group_active is not 1
          }
        })
        setSets(updatedSets)
      } catch (error) {
        console.error('Error fetching group data:', error)
      }
    }

    fetchGroupData()
  }, [])

  useEffect(() => {
    const fetchSelectedSets = async () => {
      try {
        // ดึงข้อมูลจาก sessionStorage
        const reservationData = JSON.parse(sessionStorage.getItem('reservationData'))
        const selectedUniversity = JSON.parse(sessionStorage.getItem('selectedUniversity'))

        const id = reservationData?.id
        const booking_no = reservationData?.booking_no
        const uni_id = selectedUniversity?.uni_id

        // ตรวจสอบว่าข้อมูลพร้อมหรือไม่ก่อนเรียก API
        if (!id || !uni_id || !booking_no) {
          console.error('Missing required data from sessionStorage')
          return
        }

        // เรียก API โดยใช้ id, uni_id และ booking_no
        const response = await axios.post('/api/getSelectedSets', {
          id,
          uni_id,
          booking_no
        })

        const selectedSetsData = response.data

        // อัปเดตข้อมูล `sets` โดยเทียบกับข้อมูลที่ได้จาก API
        const updatedSets = sets.map((set, index) => {
          const matchingSet = selectedSetsData.find(item => parseInt(item.booking_set) === index + 1)

          if (matchingSet) {
            return {
              ...set,
              quantity: matchingSet.amount,
              addon2: matchingSet.chang_eleph === 1,
              disabled: false
            }
          }
          return set
        })

        setSets(updatedSets)
      } catch (error) {
        console.error('Error fetching selected sets:', error)
      }
    }

    fetchSelectedSets()
  }, [])

  const handleSetChange = (index, field, value) => {
    setSets(prevSets => prevSets.map((set, i) => (i === index ? { ...set, [field]: value } : set)))
  }

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

      // Get reservationData from session storage and parse booking numbers
      const storedData = sessionStorage.getItem('resservationData')
      if (storedData) {
        const storedBookingData = JSON.parse(storedData)
        const bookingNumbers = (storedBookingData.booking_no || '').split(',').map(bn => bn.trim())
        setBookingNumbers(bookingNumbers)
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

  useEffect(() => {
    if (bookingNumbers.length > 0) {
      handleBookingNoChange({ target: { value: bookingNumbers[0] } }) // เรียกฟังก์ชัน handleBookingNoChange ด้วยค่า booking_no อันแรก
    }
  }, [bookingNumbers])

  const handleBookingNoChange = async event => {
    const selectedBookingNo = event.target.value
    setSelectedBookingNo(selectedBookingNo)

    try {
      const bookingResponse = await axios.post('/api/reservation/booking', {
        address_id: idFromUrl,
        booking_no: selectedBookingNo
      })
      setBookingResponse(bookingResponse.data[0] || {})
    } catch (error) {
      console.error('Failed to fetch booking data:', error)
      setBookingResponse({})
    }
  }

  const getSessionUser = async () => {
    const session = await getSession()
    return session?.user?.name || 'Unknown'
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setOpenSnackbar(true)
  }

  const handleAddNewBooking = () => {
    setIsAddingNewBooking(true)
  }

  const handleCancelAddBooking = () => {
    setIsAddingNewBooking(false)
    setNewBookingNo('')
  }

  const handleSaveNewBooking = async () => {
    if (newBookingNo) {
      try {
        const response = await axios.post('/api/reservation/booking/create', {
          address_id: idFromUrl,
          uni_id: bookingResponse.uni_id, // เพิ่ม uni_id จากข้อมูล bookingResponse
          film_no: searchFilm, // เพิ่ม film_no จากข้อมูล searchFilm
          booking_no: newBookingNo
        })

        if (response.data.success) {
          setBookingNumbers([...bookingNumbers, newBookingNo])
          setSelectedBookingNo(newBookingNo)
          setIsAddingNewBooking(false)
          setNewBookingNo('')
          showSnackbar('บันทึกใบจองใหม่สำเร็จ', 'success')
        } else {
          showSnackbar('บันทึกใบจองใหม่ล้มเหลว', 'error')
        }
      } catch (error) {
        console.error('Failed to save new booking:', error)
        showSnackbar('เกิดข้อผิดพลาดในการบันทึกใบจองใหม่', 'error')
      }
    }
  }

  const handleLogData = async () => {
    try {
      const update_by = await getSessionUser()
      const addressDataToSend = {
        id: idFromUrl,
        ...addressData,
        update_by,
        update_date: new Date().toISOString()
      }

      const response = await axios.post('/api/reservation/address/updateAddress', addressDataToSend)

      if (response.data.success) {
        showSnackbar('Address data saved successfully', 'success')
      } else {
        showSnackbar('Failed to save address data', 'error')
      }
    } catch (error) {
      console.error('Error saving address data:', error)
      showSnackbar('Error saving address data', 'error')
    }
  }

  const handleSaveBooking = async () => {
    try {
      const update_by = await getSessionUser()
      const bookingData = {
        ...bookingResponse,
        id: idFromUrl,
        update_by,
        update_date: new Date().toISOString()
      }

      const response = await axios.post('/api/reservation/booking/updateBooking', bookingData)

      if (response.data.success) {
        showSnackbar('Booking data saved successfully', 'success')
      } else {
        showSnackbar('Failed to save booking data', 'error')
      }
    } catch (error) {
      console.error('Error saving booking data:', error)
      showSnackbar('Error saving booking data', 'error')
    }
  }

  const handleEducationChange = field => {
    setAddressData(prev => ({
      ...prev,
      educ1: field === 'educ1' ? 'Y' : 'N',
      educ2: field === 'educ2' ? 'Y' : 'N',
      educ3: field === 'educ3' ? 'Y' : 'N',
      educ4: field === 'educ4' ? 'Y' : 'N'
    }))
  }

  const renderAddressForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
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
        <Grid item xs={12}>
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
            control={<Checkbox checked={addressData.educ1 === 'Y'} onChange={() => handleEducationChange('educ1')} />}
            label='ตรี'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ2 === 'Y'} onChange={() => handleEducationChange('educ2')} />}
            label='โท'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ3 === 'Y'} onChange={() => handleEducationChange('educ3')} />}
            label='เอก'
          />
          <FormControlLabel
            control={<Checkbox checked={addressData.educ4 === 'Y'} onChange={() => handleEducationChange('educ4')} />}
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
            onInput={e => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
            บันทึกข้อมูล
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='caption' color='textSecondary' align='center' display='block'>
            เลขฟิล์ม Update by: {addressData.update_by}{' '}
            {new Date(addressData.update_date).toLocaleString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
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
              label='ชื่อผู้รับของ'
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
              <InputLabel>อำเภอ/เขต</InputLabel>
              <Select
                value={bookingResponse.amphur || ''}
                onChange={e => handleBookingChange('amphur', e.target.value)}
                label='อำเภอ/เขต'
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
              <InputLabel>ตำบล/แขวง</InputLabel>
              <Select
                value={bookingResponse.tumbol || ''}
                onChange={e => handleBookingChange('tumbol', e.target.value)}
                label='ตำบล/แขวง'
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
              label='โทร'
              value={bookingResponse.tel || ''}
              onChange={e => handleBookingChange('tel', e.target.value)}
              onInput={e => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
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
              label='Line ID'
              value={bookingResponse.lineid || ''}
              onChange={e => handleBookingChange('lineid', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>จัดส่งหรือรับเอง</InputLabel>
              <Select
                value={bookingResponse.typeofsend || ''}
                onChange={e => handleBookingChange('typeofsend', e.target.value)}
                label='จัดส่งหรือรับเอง'
              >
                <MenuItem value={2}>จัดส่ง</MenuItem>
                <MenuItem value={1}>รับเอง</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button onClick={handleSaveBooking} variant='contained' color='primary' fullWidth>
              บันทึกข้อมูลที่อยู่การจัดส่ง
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='caption' color='textSecondary' align='center' display='block'>
              เลขใบจอง Update by: {bookingResponse.update_by}{' '}
              {new Date(bookingResponse.update_date).toLocaleString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )

  const renderSetForm = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
      <Typography variant='h5' gutterBottom>
        แบบชุด
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={3}>
          <Typography variant='subtitle1' fontWeight='bold'>
            เลือกชุด
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant='subtitle1' fontWeight='bold'>
            จำนวน
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            หน่วย
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            เพิ่มภาพหมู่
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant='subtitle1' fontWeight='bold'>
            เปลี่ยนสีกรอบ
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {sets.map((set, index) => (
          <Grid container item spacing={2} alignItems='center' key={index}>
            <Grid item xs={3}>
              <Checkbox
                checked={set.quantity > 0}
                onChange={e => handleSetChange(index, 'quantity', e.target.checked ? 1 : 0)}
                disabled={set.disabled} // ปิดการใช้งานตามสถานะจาก API
              />
              <Typography>{set.name}</Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField
                type='number'
                inputProps={{ min: 0 }}
                value={set.quantity}
                onChange={e => handleSetChange(index, 'quantity', parseInt(e.target.value) || 0)}
                disabled={set.disabled}
              />
            </Grid>
            <Grid item xs={2}>
              <Typography>ชุด</Typography>
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={set.addon1}
                    onChange={e => handleSetChange(index, 'addon1', e.target.checked)}
                    disabled={set.disabled || set.quantity === 0}
                  />
                }
                label={<PhotoIcon />}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={set.addon2}
                    onChange={e => handleSetChange(index, 'addon2', e.target.checked)}
                    disabled={set.disabled || set.quantity === 0}
                  />
                }
                label={<ColorLensIcon />}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
        ))}
      </Grid>
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
            {isAddingNewBooking ? (
              <>
                <TextField
                  fullWidth
                  variant='outlined'
                  label='เพิ่มเลขใบจอง'
                  value={newBookingNo}
                  onChange={e => setNewBookingNo(e.target.value)}
                />
                <Button variant='contained' color='primary' onClick={handleSaveNewBooking} sx={{ ml: 2 }}>
                  บันทึก
                </Button>
                <Button variant='contained' color='secondary' onClick={handleCancelAddBooking} sx={{ ml: 2 }}>
                  ยกเลิก
                </Button>
              </>
            ) : (
              <>
                <FormControl fullWidth variant='outlined' sx={{ flexGrow: 1, marginRight: '10px' }}>
                  <InputLabel>ใบจอง</InputLabel>
                  <Select value={selectedBookingNo} onChange={handleBookingNoChange} label='เลขใบจอง'>
                    {bookingNumbers.map((bookingNo, index) => (
                      <MenuItem key={index} value={bookingNo}>
                        {bookingNo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant='contained' color='primary' onClick={handleAddNewBooking} sx={{ ml: 2 }}>
                  เพิ่มใบจอง
                </Button>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  useEffect(() => {
    if (bookingNumbers.length > 0) {
      setSelectedBookingNo(bookingNumbers[0]) // ตั้งค่าเริ่มต้นเป็นค่ารายการแรก
    }
  }, [bookingNumbers])

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
          {activeTab === 'set' && renderSetForm()}
          {activeTab === 'additional' && (
            <Box>
              <Typography>เนื้อหาในแท็บเพิ่มเติม</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // ตั้งเวลาเป็น 3 วินาที
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // มุมขวาบน
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReservationInformation
