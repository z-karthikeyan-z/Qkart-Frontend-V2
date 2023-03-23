import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
        <CardMedia
          component="img"
          image={product.image}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="body2" component="div">
            {product.name}
          </Typography>
          <h6 className="title">${product.cost}</h6>
          <Rating name="read-only" value={product.rating} readOnly />
        </CardContent>
        <Button sx={{ p: 2, m:2 }} className="button" variant="contained" onClick = {handleAddToCart} startIcon={<AddShoppingCartOutlined />}>
            ADD TO CART
           </Button>
    </Card>
  );
};

export default ProductCard;
