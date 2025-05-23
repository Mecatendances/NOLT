const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  try {
    // 1. Login pour obtenir le token
    console.log('🔑 Tentative de connexion...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@fcchalon.com',
      password: 'password'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Token obtenu:', token);

    // 2. Créer un fichier test
    const testContent = 'Test image content';
    fs.writeFileSync('test.jpg', testContent);
    console.log('📄 Fichier test créé');

    // 3. Créer le FormData
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test.jpg'));

    // 4. Upload de l'image
    console.log('🚀 Tentative d\'upload...');
    const uploadResponse = await axios.post(
      'http://localhost:4000/api/products/1/images',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Réponse de l\'upload:', uploadResponse.data);
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testUpload(); 