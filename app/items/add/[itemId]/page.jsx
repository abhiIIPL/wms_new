"use client";

import { useParams } from "react-router-dom";
import AddItemPage from "../page";

export default function EditItemPage() {
  const params = useParams();
  // Just render the AddItemPage component which handles both create and edit modes
  return <div data-testid="edit-item-page"><AddItemPage /></div>;
}