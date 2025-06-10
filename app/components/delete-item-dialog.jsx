"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function DeleteItemDialog({ item, onConfirm, onCancel }) {
  const isMultiple = item?.multiple
  const items = isMultiple ? item.items : [item]
  const itemCount = items.length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="delete-item-dialog-overlay">
      <Card className="w-full max-w-md mx-4" data-testid="delete-item-dialog-card">
        <CardHeader data-testid="delete-item-dialog-header">
          <CardTitle className="flex items-center gap-2 text-destructive" data-testid="delete-item-dialog-title">
            <AlertTriangle className="h-5 w-5" data-testid="delete-item-dialog-warning-icon" />
            Delete {isMultiple ? `${itemCount} Items` : "Item"}
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="delete-item-dialog-content">
          <p className="text-muted-foreground mb-4" data-testid="delete-item-dialog-message">
            Are you sure you want to delete {isMultiple ? `these ${itemCount} items` : "this item"}? This action cannot
            be undone.
          </p>
          <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto" data-testid="delete-item-dialog-items-list">
            {items.map((singleItem, index) => (
              <div key={singleItem.id} className={index > 0 ? "mt-2 pt-2 border-t" : ""} data-testid={`delete-item-dialog-item-${index}`}>
                <div className="font-medium" data-testid={`delete-item-dialog-item-name-${index}`}>{singleItem.name}</div>
                <div className="text-sm text-muted-foreground" data-testid={`delete-item-dialog-item-description-${index}`}>{singleItem.description}</div>
                <div className="text-sm text-muted-foreground" data-testid={`delete-item-dialog-item-id-${index}`}>ID: {singleItem.id}</div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end" data-testid="delete-item-dialog-footer">
          <Button variant="outline" onClick={onCancel} data-testid="delete-item-dialog-cancel-button">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} data-testid="delete-item-dialog-confirm-button">
            Delete {isMultiple ? `${itemCount} Items` : "Item"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}