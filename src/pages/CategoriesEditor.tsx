import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  TextField,
  FormLabel,
  Stack,
  Typography,
  Divider,
} from "@mui/material";

type ItemType = {
  name: string;
};

type ItemsType = ItemType[];

type CategoryType = {
  name: string;
  items: ItemsType;
};

type CategoriesType = CategoryType[];

export function CategoriesEditor() {
  const [categories, setCategories] = useState<CategoriesType>([]);

  return (
    <Container>
      <CategoryForm
        onSubmit={(category) => {
          setCategories((prev) => [...prev, category]);
        }}
      />
      <Stack spacing={2} sx={{ mt: 2 }}>
        {categories.map((category, index) => (
          <Category key={index} category={category} />
        ))}
      </Stack>
    </Container>
  );
}

type CategoryFormProps = {
  onSubmit: (category: CategoryType) => void;
};

function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState([""]);

  function handleSumbit() {
    if (!categoryName || items[0] === "") return;
    const category = {
      name: categoryName,
      items: items.map((item) => ({ name: item })),
    };
    setCategoryName("");
    setItems([""]);
    onSubmit(category);
  }

  function handleItemChange(index: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newItems = [...items];
      newItems[index] = e.target.value;
      setItems(newItems);
    };
  }

  return (
    <Stack spacing={2}>
      <FormLabel>Create new category</FormLabel>
      <TextField
        label="Category name"
        variant="filled"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
      />
      {items.map((item, index) => (
        <TextField
          key={index}
          variant="filled"
          label="Item name"
          value={item}
          onChange={handleItemChange(index)}
        />
      ))}
      <Button
        variant="contained"
        onClick={() => {
          setItems((prev) => [...prev, ""]);
        }}
      >
        Add item
      </Button>
      <Button variant="contained" onClick={handleSumbit}>
        Add category
      </Button>
    </Stack>
  );
}

type CategoryProps = {
  category: CategoryType;
};

function Category({ category }: CategoryProps) {
  return (
    <Box
      sx={{ border: 2, borderColor: "green", borderRadius: 2, py: 1, px: 2 }}
    >
      <Typography variant="subtitle2">{category.name}</Typography>
      <Divider sx={{ my: 1 }} />
      <Items items={category.items} />
    </Box>
  );
}

type ItemsProps = {
  items: ItemsType;
};

function Items({ items }: ItemsProps) {
  return (
    <Stack spacing={1}>
      {items.map((item, index) => (
        <Item key={index} name={item.name} />
      ))}
    </Stack>
  );
}

type ItemProps = {
  name: string;
};

function Item({ name }: ItemProps) {
  return <Box>{name}</Box>;
}
