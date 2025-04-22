/*eslint-disable */



// console.log(locations);

export const displayMap = (locations) =>{
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2F1cmFiaDE4MDciLCJhIjoiY205cHoxdnAyMTd6azJrczk1Y21jZnllbSJ9.7bigo1I_zf5ULcItm88New';
  const map = new mapboxgl.Map({
      container: 'map',
      style:'mapbox://styles/mapbox/light-v11',
      scrollZoom: false
      // center:[-118.113491,34.111745],
      // zoom:4
  
      
  });
  
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';
  
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
  
      new mapboxgl.Popup({
        offset:30
      }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
  
    bounds.extend(loc.coordinates);
  });
  
  
  map.fitBounds(bounds,{
    padding:{
      top:200,
      bottom:150,
      left:100,
      right:100
    }
  });
}


// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com

