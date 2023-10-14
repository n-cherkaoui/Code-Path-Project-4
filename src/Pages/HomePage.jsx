import { useState } from 'react'
import viteLogo from '/vite.svg'
import './HomePage.css'
const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function HomePage() {
    const [bannedData, setBannedData] = useState({
        bannedOrigins: new Set(),
        // bannedWeights: new Set(),
    });
    const [currentData, setCurrentData] = useState({
        currentOrigin: "",
        currentName: "",
        currentLifeSpan: "",
        currentImage: null
    });
    const [rendered, setRender] = useState(false);

    function banOrigin() {
        setBannedData({
            bannedOrigins: new Set(bannedData.bannedOrigins).add(currentData.currentOrigin)
        })
    }

    const render = () => {
        if (!rendered) {
            setRender(true)
        }
        buildQuery()
    }
    
    function buildQuery(){
        var param = "?has_breeds=1"
        var route = '/v1/images/search'
        var url = "https://api.thecatapi.com" + route + param;
        callAPI(url).catch(console.error)
    }

    async function callAPI(url) {
        var retries = 0;
        const maxRetries = 5;
        
        while (retries < maxRetries){

            // console.log(url)
            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    'x-api-key': ACCESS_KEY
                }
            });
            const json = await response.json()
            // console.log(json)

            if (!json || json[0].url == null) {
                const alert = "Oops! Something went wrong with that query, let's try again!"
                console.log(alert)
                break;
                // alert(alert)
            }
            else {
                if (bannedData.bannedOrigins.has(json[0].breeds[0].origin)) {
                    retries ++;

                    if (retries >= maxRetries){
                        alert("requested image not found");
                        break;
                    }
                    continue
                }
                setCurrentData({
                    currentOrigin: json[0].breeds[0].origin,
                    currentName: json[0].breeds[0].name,
                    currentLifeSpan: json[0].breeds[0].life_span,
                    currentImage: json[0].url,
                });
                break;
                // setPrevImages((images) => [...images, json.url]);
                // reset();
            }
        }
    }

    return (
        <div className="homePage">
            <div className='Main'>
                <h1>Free Cat Photos</h1>
                <div className="catContainer container">
                    {rendered ? 
                        <div className="container infoBoxes">
                            <div className="infoBox originBox" onClick={banOrigin}>{currentData.currentOrigin}</div>
                            <div className="infoBox nameBox" onClick={banOrigin}>{currentData.currentName}</div>
                            <div className="infoBox lifeSpanBox" onClick={banOrigin}>{currentData.currentLifeSpan}</div>
                        </div> 
                    : <></>}
                    {rendered ?
                    <img src={currentData.currentImage}></img>
                    : <></>}
                    <button className="randomizer" onClick={render}>🔀 Discover!</button>
                </div>
            </div>
            <div className="container banList">
                <h3>Select an origin to ban it</h3>
                <ul>
                    {bannedData && bannedData.bannedOrigins && bannedData.bannedOrigins.size > 0 ? (Array.from(bannedData.bannedOrigins).map((origin, index) => 
                        <li className="origin" key={index}>
                            {origin}
                        </li>
                    )) : (
                        <p></p>
                    )}
                </ul>
            </div>
            
        </div>
    )
}

export default HomePage
