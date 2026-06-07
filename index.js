
//-----------------------------------AXIOS------------------------------------------------------------------
//import { start } from "node:repl";
//import { ifError } from "node:assert";
import * as Carousel from "./Carousel.js";
import { API_KEY } from "./keys.js";
export async function favourite(id) {
  try {
  
    console.log("Favourite:", id);


    const response = await axios.get("/favourites");
    const isFavourite = response.data.find(fav => fav.image_id === id);

    if (isFavourite) {
      await axios.delete(`/favourites/${isFavourite.id}`);
      console.log(`Favourite with id ${isFavourite.id} is deleted`);
    }
    else {
      console.log("Not favourited, doing now");
      await axios.post("/favourites",
        { image_id: id }
      );
      console.log("Favourite added");
    }
  } catch (error) {
    console.error("Favourite error:", error)
  }
}

console.log("axios =", axios);
// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const favBtn = document.getElementById("getFavouritesBtn");


// Step 0: Store your API key in the keys.js file.

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 * 
 */
//---------------Function initialLoad to retrieve list of breeds-----------------------------------------------
async function initialLoad() {

  try {
    const response = await axios.get(("/breeds"), {
      onDownloadProgress: updateProgess
    });

    const breeds = response.data;
    console.log("breeds:", breeds);
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });
    if (breeds.length > 0)
      await getBreed(breeds[0].id);
  }
  catch (error) {
    console.error("unable to fetch breeds:", error);
  }
}


//-------------------default headers--------------------------
axios.defaults.headers.common["x-api-key"] = API_KEY;

//-------------------default base URL---------------------------

axios.defaults.baseURL = "https://api.thecatapi.com/v1/"



/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
//----------------------Event-handler  for breedSelect-------------------------------------------------

breedSelect.addEventListener("change", async (e) => {
  getBreed(e.target.value);
});

//-----------------------------------------Function getBreed---------------------------------------
async function getBreed(breedId) {

  try {

    Carousel.clear();
    const response = await axios.get("/images/search",
      {
        params: {
          breed_ids: breedId,
          limit:18
        }, onDownloadProgress: updateProgess
      });

    //-------------------display cat pics---------------------------------------------------
    const pics = response.data;
    buildCarousel(pics);
    const breedPic = pics[0]?.breeds[0];
    if (breedPic) {
      infoDump.innerHTML = `<h1>${breedPic.name}</h1>
                          <p>${breedPic.description}</p>
                          <p>${breedPic.origin}</p>
                          <p>${breedPic.temperament}</p>`;


    }
    Carousel.start();
  }

  catch (error) {
    console.error("Unable to Display:", error);
  }

}
//-------------------------------------Build Carousel--------------------------------------------------------
function buildCarousel(pics) {
  pics.forEach((pic) => {
    const carouselItem = Carousel.createCarouselItem(
      pic.url,
      "Cat image",
      pic.id || pic.url
    );

    Carousel.appendCarousel(carouselItem);
  });
}



/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */


/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */

//-------------------default headers--------------------------
// axios.defaults.headers.common["x-api-key"]=API_KEY;

//-------------------default base URL---------------------------

//axios.defaults.baseURL="https://api.thecatapi.com/v1/"

/**
* 5. Add axios interceptors to log the time between request and response to the console.
* - Hint: you already have access to code that does this!
* - Add a console.log statement to indicate when requests begin.
* - As an added challenge, try to do this on your own without referencing the lesson material.
*/

//------------------------Axios interceptors------------------------------------------------------

axios.interceptors.request.use((config) => {
  console.log("Request started");
  config.metadata = {
    startTime: new Date()
  }
  console.log("Request started at:", config.metadata.startTime);
  progressBar.style.width = "0%";
  document.body.style.cursor = "progress";
  return config;
});

axios.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    console.log("request ended at :", endTime);
    if (response.config.metadata.startTime) {
      const duration = endTime - response.config.metadata.startTime;
      console.log("Request Duration is:", duration);
    }
    progressBar.style.width = "100%";
    document.body.style.cursor = "default";
    return response;


  },

  (error) => {
    console.log("failed")
    progressBar.style.width = "100%";
    document.body.style.cursor = "default";
    return Promise.reject(error);
  }
);


/**
* 6. Next, we'll create a progress bar to indicate the request is in progress.
* - The progressBar element has already been created for you.
*  - You need only to modify its "width" style property to align with the request progress.
* - In your request interceptor, set the width of the progressBar element to 0%.
*  - This is to reset the progress with each request.
* - Research the axios onDownloadProgress config option.
* - Create a function "updateProgress" that receives a ProgressEvent object.
*  - Pass this function to the axios onDownloadProgress config option in your event handler.
* - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
*  - Update the progress of the request using the properties you are given.
* - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
*   once or twice per request to this API. This is still a concept worth familiarizing yourself
*   with for future projects.
*/
//---------------------Function updateProgress----------------------------------------------------

function updateProgess(e) {
  /* const loaded=e.loaded;
   const total=e.total;*/
  const { loaded, total } = e;
  if (total) {
    console.log("Total is:", total)
    const percent = Math.round(loaded * 100 / total);
    progressBar.style.width = percent + "%";
    console.log("progress bar:", percent + "%");
  }
  else {

    console.log("No total Value,progress loading");    //If no total value ,set the progress bar width at 40%
    progressBar.style.width = "40%";
  }
}



/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

//-----------------------------get favourites-function to display Favourites---------------------------------------------

async function getFavourites()
{
  try{
Carousel.clear();
const response=await axios.get("/favourites");
console.log("Favourites:",response.data);
const pics=response.data.map(fav=>({url:fav.image?.url,
  id:fav.image_id,
  breeds:fav.image?.breeds||[]
}));
buildCarousel(pics);
Carousel.start();
  }catch(error){
    console.error("Failed to display Favourites",error);
  }

  }


  //-----------------------------------event listener for getFavourites()---------------------------------
  favBtn.addEventListener("click",getFavourites);
/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
window.addEventListener("DOMContentLoaded", () => {
  initialLoad();
});