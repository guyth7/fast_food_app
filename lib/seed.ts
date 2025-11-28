import { ID } from "react-native-appwrite";
import { appwriteConfig, databases } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  try {
    const list = await databases.listDocuments(
      appwriteConfig.databaseId,
      collectionId
    );

    await Promise.all(
      list.documents.map((doc) =>
        databases.deleteDocument(
          appwriteConfig.databaseId,
          collectionId,
          doc.$id
        )
      )
    );
  } catch (error) {
    console.log(`Warning: Could not clear collection ${collectionId}`, error);
  }
}

// Function commented out to prevent Storage permission errors for now
/* async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);
  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
}
*/

// Function commented out to prevent Network/Blob errors for now
/*
async function uploadImageToStorage(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const fileObj = {
    name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
    type: blob.type,
    size: blob.size,
    uri: imageUrl,
  };

  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    fileObj
  );

  return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}
*/

async function seed(): Promise<void> {
  console.log("🌱 Starting Seeding...");

  // 1. Clear all Database Collections
  await clearAll(appwriteConfig.categoriesTableID);
  await clearAll(appwriteConfig.customizationsTableID);
  await clearAll(appwriteConfig.menuTableID);
  await clearAll(appwriteConfig.menuCustomizationsTableID);

  // Skip storage clearing to prevent crashes
  // await clearStorage();

  // 2. Create Categories
  console.log("...Seeding Categories");
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTableID,
      ID.unique(),
      cat
    );
    categoryMap[cat.name] = doc.$id;
  }

  // 3. Create Customizations
  console.log("...Seeding Customizations");
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsTableID,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      }
    );
    customizationMap[cus.name] = doc.$id;
  }

  // 4. Create Menu Items
  console.log("...Seeding Menu Items");
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    // FIX: Bypass image upload to avoid Network Request Failed error
    // const uploadedImage = await uploadImageToStorage(item.image_url);

    // We use the raw URL string directly.
    // Later, you can manually upload images or fix the upload function.
    const uploadedImage = item.image_url;

    // Safety check: ensure category exists
    const categoryId = categoryMap[item.category_name];
    if (!categoryId) {
      console.warn(`Category not found for item: ${item.name}`);
      continue;
    }

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuTableID,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryId,
      }
    );

    menuMap[item.name] = doc.$id;

    // 5. Create menu_customizations
    if (item.customizations && item.customizations.length > 0) {
      for (const cusName of item.customizations) {
        // Safety check: ensure customization exists in the map
        if (customizationMap[cusName]) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationsTableID,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            }
          );
        } else {
          console.log(`Skipping customization '${cusName}' (not found in DB)`);
        }
      }
    }
  }

  console.log("✅ Seeding complete.");
}

export default seed;
