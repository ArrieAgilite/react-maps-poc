import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Geocode from 'react-geocode'

import icon from './images/icon.png'

// We will use these things from the lib
// https://react-google-maps-api-docs.netlify.com/
import {
  LoadScript,
  GoogleMap,
  Marker,
  InfoWindow
} from '@react-google-maps/api'

function App () {
  const [mapRef, setMapRef] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [markerMap, setMarkerMap] = useState({})
  const [center, setCenter] = useState({ lat: 0, lng: 0 })
  const [infoOpen, setInfoOpen] = useState(false)
  const [places, setPlaces] = useState([])

  const getMyPlaces = () => {
    const tmpArray = [
      {
        id: 'doe',
        address: null,
        name: 'John Doe',
        markerSize: { width: 30, height: 30 },
        pos: {
          lat: -33.7421825090221,
          lng: 19.011633172357847
        }
      },
      {
        id: 'doe2',
        address: null,
        name: 'John Doe 2',
        markerSize: { width: 30, height: 30 },
        pos: {
          lat: -33.63241331147623,
          lng: 19.935613458427238
        }
      }
    ]

    setPlaces(tmpArray)
  }

  useEffect(() => {
    getMyPlaces()
  }, [])

  useEffect(() => {
    if (mapRef) {
      fitBounds(mapRef)
      console.log('doing fitBounds')
    }
  }, [places])

  // Iterate myPlaces to size, center, and zoom map to contain all markers
  const fitBounds = map => {
    const bounds = new window.google.maps.LatLngBounds()

    places.map(place => {
      bounds.extend(place.pos)
      return place.id
    })

    map.fitBounds(bounds)
  }

  const loadHandler = map => {
    // Store a reference to the google map instance in state
    setMapRef(map)
    // Fit map bounds to contain all markers
    fitBounds(map)
  }

  // We have to create a mapping of our places to actual Marker objects
  const markerLoadHandler = (marker, place) => {
    return setMarkerMap(prevState => {
      return { ...prevState, [place.id]: marker }
    })
  }

  const markerClickHandler = (event, place) => {
    // Remember which place was clicked
    place.address = getAddress(place.pos, (result) => {
      place.address = result
      place.markerSize = { width: 50, height: 50 }
      setSelectedPlace(place)

      // Required so clicking a 2nd marker works as expected
      if (infoOpen) {
        setInfoOpen(false)
      }

      setInfoOpen(true)

      // if you want to center the selected Marker
      setCenter(place.pos)
    })
  }

  const showUserPin = (id, place, event) => {
    places.map(tmpPlace => {
      if (tmpPlace.id === id) {
        tmpPlace.animation = window.google.maps.Animation.DROP
      }

      return null
    })

    setInfoOpen(false)
    markerClickHandler(event, place)
    setPlaces(places)
    setCenter(place.pos)
  }

  // To show address in info window 
  const getAddress = (pos, callback) => {
    let address = 'Not Found'

    Geocode.fromLatLng(pos.lat, pos.lng)
      .then((response) => {
        address = response.results[0].formatted_address

        callback(address)
      })
      .catch((err) => {
        console.log(err)
        address = 'Not Found'

        callback(address)
      })

    return address
  }

  const injectUser = () => {
    const tmpArray = places

    tmpArray.push({
      id: 'doe3',
      address: null,
      name: 'John Doe 3',
      markerSize: { width: 30, height: 30 },
      pos: {
        lat: -25.706844782983676,
        lng: 28.026123041564087
      }
    })

    setPlaces(tmpArray)
    fitBounds(mapRef)
  }

  const renderMap = () => {
    Geocode.setApiKey('')

    return (
      <LoadScript
        id='script-loader'
        googleMapsApiKey=''
      >
        <GoogleMap
          // Do stuff on map initial laod
          onLoad={loadHandler}
          // Save the current center position in state
          onCenterChanged={() => setCenter(mapRef.getCenter().toJSON())}
          center={center}
          mapContainerStyle={{
            height: '70vh',
            width: '100%'
          }}
        >
          {places.map(place => (
            <Marker
              key={place.id}
              position={place.pos}
              onLoad={marker => markerLoadHandler(marker, place)}
              onClick={event => {
                markerClickHandler(event, place)
              }}
              icon={{
                url: icon,
                scaledSize: place.markerSize
              }}
              animation={place.animation}
            />
          ))}

          {infoOpen && selectedPlace && (
            <InfoWindow
              anchor={markerMap[selectedPlace.id]}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div>
                <h3>{selectedPlace.name}</h3>
                <div>Address: {selectedPlace.address}</div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Our center position always in state */}
        <h3>
          Center {center.lat}, {center.lng}
        </h3>

        {/* Users Pin Links */}
        {places.map(place => {
          return <p key={place.id} style={{ color: 'blue', cursor: 'pointer' }} onClick={(event) => showUserPin(place.id, place, event)}>{place.name}</p>
        })}

        <button style={{ cursor: 'pointer', padding: 5 }} onClick={() => injectUser()}>Inject User</button>
        <button
          style={{ cursor: 'pointer', padding: 5 }} 
          onClick={() => {
            getMyPlaces()
            fitBounds(mapRef)
          }}>Fetch Users
        </button>
      </LoadScript>
    )
  }

  return renderMap()
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
