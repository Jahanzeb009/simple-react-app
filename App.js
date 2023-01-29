import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Dimensions, Image, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export default function App() {

  const [imageData, setImageData] = useState(null) //pick image data
  const [name, setName] = useState('')// set Image name
  const [expiration, setExpiration] = useState(null) // set image expiration time in seconds range (60-15552000)
  const [uploadedImage, setUploadedImage] = useState(null) // data comes from imgBB
  const [loading, setLoading] = useState(false) // image is loading or not

  const { width: w } = Dimensions.get('screen')

  let toast = text => ToastAndroid.show(text, ToastAndroid.SHORT)

  // pick image from storage
  const pickImage = async () => {

    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    }).then(result => {
      if (!result.canceled) {
        setImageData(result.assets[0])
      }
    })
  };

  // upload image to imgBB
  let uploadImage = () => {

    toast('Uploading...')

    var formdata = new FormData();
    formdata.append("key", "YOUR_API_KEY");
    formdata.append("image", imageData.base64);
    if (name !== '') formdata.append("name", name)
    if (expiration !== null) formdata.append("expiration", expiration)

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch("https://api.imgbb.com/1/upload", requestOptions)
      .then(response => response.json())
      .then(result => {
        // console.log('from server', result)
        if (result.success) {
          setUploadedImage(result.data)
          setName('')
          toast('Image uploaded successfully')
        } else {
          toast('Image upload failed')
        }
      })
      .catch(error => console.log('error', error));
  }

  return (
    <View style={styles.container}>

      <StatusBar style="auto" />

      <Text style={{ fontSize: 30 }}>ImgBB Image Upload</Text>

      {/* Show Picked Image */}
      {imageData && <Image
        source={{ uri: imageData?.uri }}
        style={{ width: 100, aspectRatio: 1, resizeMode: 'contain' }}
      />}

      {/* Pick Image Button */}
      <View style={{ marginTop: 10 }}>
        <Button title='Pick image from Storage' onPress={pickImage} />
      </View>

      {/* Set Name, Expiration */}
      <TextInput
        placeholder='Enter image name (optional)'
        value={name}
        style={styles.textInput}
        onChangeText={t => setName(t)}
      />
      <TextInput
        placeholder='Enter Expiry Time in sec (optional)'
        keyboardType='number-pad'
        style={styles.textInput}
        onChangeText={t => setExpiration(t)}
      />

      {/* Upload Image Button */}
      <View style={{ marginTop: 10 }}>
        <Button title='uploadImage' onPress={uploadImage} />
      </View>

      {/* Indicator while image is loading from link/uri */}
      <ActivityIndicator animating={loading} size='large' />

      {/* Uploaded Image */}
      {uploadedImage !== null ? <>
        <Image
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          source={{ uri: uploadedImage.image?.url }}
          style={{ width: w - 20, aspectRatio: 1, resizeMode: 'contain' }}
        />

        <Text>Image Name: {uploadedImage.title}</Text>
        <Text>Size: {(uploadedImage.size / 1024).toFixed(1)} kb</Text>
      </> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10
  },
  textInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginTop: 10,
    padding: 10
  }
});
