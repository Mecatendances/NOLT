import { Box, Image, Text, Button } from "@chakra-ui/react";
import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
      <Image src={product.image || "/assets/default.jpg"} alt={product.name} />
      <Text mt={2} fontSize="xl" fontWeight="bold">{product.name}</Text>
      <Text color="gray.500">{product.price} €</Text>
      <Button colorScheme="blue" mt={2} onClick={() => addToCart(product)}>Ajouter au panier</Button>
    </Box>
  );
}
