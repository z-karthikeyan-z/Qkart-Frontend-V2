import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart, {generateCartItemsFrom} from "./Cart"

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
import "./Products.css";


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {

  const { enqueueSnackbar } = useSnackbar();

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(setTimeout(()=>{},0))
  const [log, setLog] = useState(localStorage.getItem("token"))
  const [allProducts, setAllProducts] = useState([])
  const [cartItems, setCartItems] = useState([])


  const performAPICall = async() => {
    setIsLoading(true);
      try{
        const resp = await axios.get(`${config.endpoint}/products`).then((response)=>{
          return response.data;
        }).catch((error)=>{
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        });
        setIsLoading(false);
        return resp;
      }
      catch (error) {
        enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: "error" });
        }
        setIsLoading(false);
      };


  useEffect(() => {
    let task = async() => {
      const productsData = await performAPICall();
      setProducts(productsData);
      setAllProducts(productsData);
      if(log){
      const cardData = await fetchCart(localStorage.getItem("token"));
      const cartDetails = generateCartItemsFrom(cardData, productsData);
      setCartItems(cartDetails)
      }
    }
      task();
  }, []);


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    setIsLoading(true);
    try{
       axios.get(`${config.endpoint}/products/search?value=${text}`).then((response)=>{
        setProducts(response.data);
      }).catch((error)=>{
        if(error.response.status === 500){
          enqueueSnackbar(error.response.data.message, { variant: "error" });
          performAPICall()
        }
        if(error.response.status === 404){
          setProducts([])
        }
      })
    }
    catch (error) {
      enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: "error" });
      }
      setIsLoading(false);
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let text = event.target.value;
    if(debounceTimeout){
      clearTimeout(debounceTimeout);
    }
    setDebounceTimeout(setTimeout(()=>{
      performSearch(text);
    }, 500))
  };


  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const res = await axios.get(`${config.endpoint}/cart`,{headers:{Authorization: "Bearer "+token}})
      return res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      console.log("error 444")
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let duplicate = false
    items.forEach((prod) => {
      if(prod._id === productId){
        duplicate = true;
      }
    });
    return duplicate;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if(!log){
      enqueueSnackbar(
        "Login to add an item to the Cart",
        {
          variant: "warning",
        }
      );
      return;
    }
    if(isItemInCart(items, productId) && options.preventDuplicate){
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "warning",
          }
        );
        return;
      }
      try{
        const resp = await axios.post(`${config.endpoint}/cart`, {productId, qty}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        let fetchData = generateCartItemsFrom(resp.data, products);
        setCartItems(fetchData);
      }
      catch(e){
        if(e.response){
          enqueueSnackbar(e.response.data.message, {variant: "error"});
        }
        else{
          enqueueSnackbar(
            "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
            {
              variant: "error",
            }
          );
        }
      }

  };


  return (
    <div>
      <Header logUpdate = {() => {setLog(false);
      }}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        onChange = {(e)=>{
          debounceSearch(e, debounceTimeout);
        }}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange = {(e)=>{
          debounceSearch(e, debounceTimeout);
        }}
      />
      <Grid container spacing = {2}>
        <Grid item key= {1} sm={12} md={log ? 9 : 12}>
        <Grid container>
         <Grid item key = {3} className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
         {isLoading ? (
          <Box style={{display: 'flex', flexDirection:"column",justifyContent:'center',alignItems:'center', width: "100%", height: "300px"}}>
          <CircularProgress/>
          <p>Loading Products</p>   
          </Box>
         ): ( products.length ? (
          <Grid container spacing={2} my={3}>
              {
                  products.map((product)=>{
                    return(
                    <Grid item key={product._id} xs={6} md={3}>
                      <ProductCard
                      product={product}
                      key = {product._id}
                      handleAddToCart = {()=> addToCart(log,cartItems,allProducts, product._id, 1,{ preventDuplicate: true })}
                    />
                    </Grid>
                    )
                  })
                }
              </Grid>
              ):(
                <Box style={{display: 'flex', flexDirection:"column",justifyContent:'center',alignItems:'center', width: "100%", height: "300px"}}>
                <SentimentDissatisfied />
                <h3>No products found</h3>
              </Box>
              )
         )}
       </Grid>
        </Grid>
        {log ? (
          <Grid item key={2} xs={12} md = {3} style={{padding:"0",  marginTop:"1rem", backgroundColor: "#E9F5E1"}}>
            <Cart products = {allProducts} items = {cartItems} handleQuantity={addToCart} />
          </Grid>
        ): (
          <></>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
