# Mobile App - React Native + Expo

Cross-platform real estate application for iOS and Android.

## Project Structure

```
mobile/
├── app/                         # Expo Router navigation
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home/Map tab
│   │   ├── search.tsx          # Search tab
│   │   ├── saved.tsx           # Saved properties tab
│   │   └── account.tsx         # Account tab
│   ├── property/
│   │   └── [id].tsx            # Property detail
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── otp.tsx
│   ├── chat/
│   │   ├── index.tsx           # Conversations list
│   │   └── [id].tsx            # Chat detail
│   ├── _layout.tsx             # Root layout
│   └── index.tsx               # Loading screen
│
├── components/                 # Reusable components
│   ├── Map/
│   │   ├── MapView.tsx         # MapLibre GL Native
│   │   ├── PropertyMarker.tsx
│   │   └── LayerToggle.tsx
│   ├── Property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetail.tsx
│   │   └── PropertyImages.tsx
│   ├── Search/
│   │   ├── SearchFilters.tsx
│   │   └── FilterBottomSheet.tsx
│   ├── Common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── BottomSheet.tsx
│   │   └── Toast.tsx
│   └── Chat/
│       ├── MessageBubble.tsx
│       └── ChatInput.tsx
│
├── hooks/                      # Custom hooks
│   ├── useMap.ts
│   ├── useGeospatial.ts
│   ├── useAuth.ts
│   ├── useGraphQL.ts
│   ├── useLocation.ts
│   └── usePagination.ts
│
├── store/                      # Zustand state
│   ├── authStore.ts
│   ├── searchStore.ts
│   ├── mapStore.ts
│   ├── propertyStore.ts
│   ├── chatStore.ts
│   └── uiStore.ts
│
├── lib/                        # Utilities
│   ├── api.ts                 # GraphQL/REST client
│   ├── geospatial.ts          # Geo calculations
│   ├── maplibre.ts            # MapLibre helpers
│   ├── constants.ts
│   ├── utils.ts
│   └── format.ts
│
├── types/                      # TypeScript types
│   ├── index.ts
│   ├── property.ts
│   ├── user.ts
│   └── geo.ts
│
├── styles/                     # Theme & styles
│   ├── theme.ts
│   ├── colors.ts
│   └── spacing.ts
│
├── assets/                     # Images, icons, fonts
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json                    # Expo config
├── package.json
├── tsconfig.json
├── eas.json                    # EAS build config
├── .env.example
├── Dockerfile
└── README.md
```

## Key Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "expo-router": "~3.0.0",
    "expo-location": "~17.0.1",
    "expo-av": "~13.10.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    
    "maplibre-react-native": "^10.0.0",
    "@mapbox/mapbox-gl-native": "^6.0.0",
    "react-native-gesture-handler": "~2.14.0",
    
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "graphql-request": "^6.0.0",
    
    "zustand": "^4.4.0",
    "@react-native-async-storage/async-storage": "~1.21.0",
    
    "react-native-bottom-sheet": "^4.4.0",
    "react-native-reanimated": "~3.6.0",
    "@bottom-sheet/bottom-sheet": "^5.0.0",
    
    "react-native-vector-icons": "^10.0.0",
    "expo-image-picker": "~14.7.1",
    
    "@react-native-masked-view/masked-view": "^0.2.9",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.37",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.3.0",
    "@testing-library/react-native": "^12.4.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0"
  }
}
```

## Configuration

### app.json (Expo)

```json
{
  "expo": {
    "name": "RealEstate",
    "slug": "realestate-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.realestate.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.realestate.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermissions": "Allow RealEstate to access your location."
        }
      ]
    ]
  }
}
```

### eas.json (Build & Deploy)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview2": {
      "android": {
        "buildType": "aab"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": {
        "certificateP12Path": "PATH_TO_P12",
        "certificateP12Password": "PASSWORD",
        "appleId": "YOUR_APPLE_ID",
        "appleTeamId": "TEAM_ID"
      },
      "android": {
        "serviceAccount": "PATH_TO_SERVICE_ACCOUNT_JSON",
        "track": "internal"
      }
    }
  }
}
```

## Environment Variables

```env
EXPO_PUBLIC_API_URL=http://YOUR_API_URL
EXPO_PUBLIC_GRAPHQL_URL=http://YOUR_API_URL/graphql
EXPO_PUBLIC_MAPLIBRE_STYLE=https://tiles.example.com/style.json
EXPO_PUBLIC_FEATURE_3D=true
```

## Key Components

### MapView (Native)

```tsx
// components/Map/MapView.tsx
import { useNativeDriver } from 'react-native-reanimated';
import MapLibreGL from '@maplibre-react-native/maps';
import { useMapStore } from '../../store/mapStore';

export const MapView: React.FC = () => {
  const { center, zoom } = useMapStore();

  return (
    <MapLibreGL.MapView
      style={{ flex: 1 }}
      styleURL="https://tiles.example.com/style.json"
      zoomLevel={zoom}
      centerCoordinate={[center.longitude, center.latitude]}
    >
      <MapLibreGL.Camera
        zoomLevel={zoom}
        centerCoordinate={[center.longitude, center.latitude]}
      />
      {/* Property markers */}
    </MapLibreGL.MapView>
  );
};
```

### Property Detail with Images

```tsx
// app/property/[id].tsx
import { Image, ScrollView } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_PROPERTY } from '../queries';

export default function PropertyDetail({ id }: { id: string }) {
  const { data, loading } = useQuery(GET_PROPERTY, { variables: { id } });

  if (loading) return <LoadingSpinner />;

  const property = data.property;

  return (
    <ScrollView>
      <ImageCarousel images={property.images} />
      <PropertyCard property={property} />
      <VisitButton propertyId={property.id} />
      <InquiryForm propertyId={property.id} />
    </ScrollView>
  );
}
```

### Chat Screen with WebSocket

```tsx
// app/chat/[id].tsx
import { FlatList, TextInput } from 'react-native';
import { useQuery, useSubscription } from '@apollo/client';
import { CONVERSATION_MESSAGES, MESSAGE_RECEIVED } from '../queries';

export default function ChatScreen({ id }: { id: string }) {
  const { data: messages } = useQuery(CONVERSATION_MESSAGES, {
    variables: { conversationId: id },
  });

  const { data: newMessage } = useSubscription(MESSAGE_RECEIVED, {
    variables: { conversationId: id },
  });

  return (
    <>
      <FlatList
        data={messages?.messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
      />
      <ChatInput conversationId={id} />
    </>
  );
}
```

## Running Locally

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
i

# Run on Android emulator
a

# Build for production
eas build --platform all
```

## Platform-Specific Setup

### iOS
```bash
# Install pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios
```

### Android
```bash
# Ensure emulator is running
emulator -avd YourEmulator

# Run on Android
npm run android
```

## Building & Deployment

### Deploy to App Store

```bash
eas build --platform ios --auto-submit
```

### Deploy to Google Play

```bash
eas build --platform android --auto-submit
```

## Performance Optimization

- Lazy load property images
- Memoize components to prevent re-renders
- Use native modules for heavy computation
- Implement pagination on lists
- Cache GraphQL responses locally
- Use WebView for 3D models instead of rendering in React Native
