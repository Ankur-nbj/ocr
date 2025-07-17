import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, CircularProgress
} from '@mui/material';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', gender: '', dob: '', address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      extractData(file);
    }
  };

  const extractData = async (file) => {
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      console.log('frontendapi called');
      const res = await axios.post('http://localhost:8080/api/ocr/extract', form);
      console.log(res.data);
      setFormData({
        name: res.data.name || '',
        fatherName: res.data.fatherName || '',
        gender: res.data.gender || '',
        dob: res.data.dob || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => formData.name && formData.dob && formData.gender && formData.fatherName;

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" gutterBottom>Auto-Fill Form from ID</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" component="label">
          Upload Image
          <input hidden type="file" accept="image/*" onChange={handleImageChange} />
        </Button>
        {preview && <Box mt={2}><img src={preview} alt="Preview" width="100%" /></Box>}
      </Paper>
      {loading ? <CircularProgress /> : (
        <Paper sx={{ p: 2 }}>
          <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Gender" name="gender" value={formData.gender} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="DOB" name="dob" value={formData.dob} onChange={handleChange} margin="normal" required />
          <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} margin="normal" multiline rows={2} />
          <Button variant="contained" sx={{ mt: 2 }} disabled={!validate()}>Submit</Button>
        </Paper>
      )}
    </Box>
  );
}

export default App;
