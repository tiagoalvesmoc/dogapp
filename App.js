import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const App = () => {
  const [dogData, setDogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedImages, setLikedImages] = useState({});

  useEffect(() => {
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-api-key": "DEMO-API-KEY"
    });

    const requestOptions = {
      method: 'GET',
      headers: headers,
      redirect: 'follow'
    };

    fetch("https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=10", requestOptions)
      .then(response => response.json())
      .then(result => {
        setDogData(result);
        setLoading(false);
      })
      .catch(error => {
        console.log('error', error);
        setLoading(false);
      });
  }, []);

  const toggleLike = (id) => {
    setLikedImages(prevLikedImages => ({
      ...prevLikedImages,
      [id]: !prevLikedImages[id]
    }));
  };

  const shareImage = async (url) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(url);
    } else {
      alert("Sharing is not available on this device");
    }
  };

  const downloadImage = async (url) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const fileUri = `${FileSystem.documentDirectory}${url.split('/').pop()}`;
        const { uri } = await FileSystem.downloadAsync(url, fileUri);
        await MediaLibrary.createAssetAsync(uri);
        alert('Image downloaded successfully!');
      } else {
        alert('Permission to access media library is required!');
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {dogData.map((dog) => (
        <View key={dog.id} style={styles.card}>
          <Text style={styles.title}>Breed: {dog.breeds[0].name}</Text>
          <Image source={{ uri: dog.url }} style={styles.image} />
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => shareImage(dog.url)}
            >
              <FontAwesome 
                name="share" 
                size={24} 
                color="#B3C8CF" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => downloadImage(dog.url)}
            >
              <FontAwesome 
                name="download" 
                size={24} 
                color="#B3C8CF" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.likeButton]}
              onPress={() => toggleLike(dog.id)}
            >
              <FontAwesome 
                name={likedImages[dog.id] ? "heart" : "heart-o"} 
                size={24} 
                color={likedImages[dog.id] ? "#D04848" : "#B3C8CF"}    
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {
    width: 320,
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  iconButton: {
    padding: 5,
  },
  likeButton: {
    alignSelf: 'flex-end',
  },
});

export default App;
