# Android UI Specification

Adattamento delle UI Features per Android seguendo le Material Design 3 Guidelines.

---

## 1. **Sistema Dark Theme**

```typescript
// src/constants/theme.ts - Android adaptation
colors: {
  background: '#121212',      // Material Dark surface
  surface: '#1E1E1E',         // Elevated surface +1
  surfaceVariant: '#2D2D2D',  // Elevated surface +2
  cardSolid: '#252525',       // Card background
  border: '#3D3D3D',          // Outline variant
  primary: '#BB86FC',         // Material Purple primary
  secondary: '#03DAC6',       // Material Teal secondary
}
```
Utilizza la palette Material Design 3 per dark mode con elevation tinting.

---

## 2. **Typography Scale (Material Type Scale)**

```typescript
typography: {
  displayLarge: { fontSize: 57, fontWeight: '400', letterSpacing: -0.25 },
  displayMedium: { fontSize: 45, fontWeight: '400' },
  headlineLarge: { fontSize: 32, fontWeight: '400' },    // Screen headers
  headlineMedium: { fontSize: 28, fontWeight: '400' },   // Section headers
  titleLarge: { fontSize: 22, fontWeight: '400' },       // Card titles
  titleMedium: { fontSize: 16, fontWeight: '500' },      // Subtitles
  bodyLarge: { fontSize: 16, fontWeight: '400' },        // Body text
  bodyMedium: { fontSize: 14, fontWeight: '400' },       // Secondary text
  labelLarge: { fontSize: 14, fontWeight: '500' },       // Buttons
  labelSmall: { fontSize: 11, fontWeight: '500' },       // Metadata
}
```
Segue la Material Type Scale con Roboto come font di sistema.

---

## 3. **Bottom Navigation Bar**

```typescript
// src/navigation/AppNavigator.tsx - Android version
tabBarStyle: {
  backgroundColor: colors.surface,
  borderTopWidth: 0,
  elevation: 8,                    // Material elevation shadow
  height: 80,
  paddingBottom: 16,
}

// Navigation bar items con Material ripple
<Pressable android_ripple={{ color: 'rgba(187, 134, 252, 0.2)' }}>
```
- **NO blur effect** su Android (non nativo)
- Usa elevation shadows invece del blur
- Aggiungi ripple effect sui tap
- Icone filled quando attive (Material style)

---

## 4. **Card Carousel con Material Cards**

```typescript
// MediaCard.tsx - Android adaptation
cardStyle: {
  borderRadius: 12,              // Material medium radius
  elevation: 2,                  // Subtle shadow
  backgroundColor: colors.surface,
}

// Pressed state con ripple invece di scale
<Pressable
  android_ripple={{
    color: 'rgba(255,255,255,0.1)',
    borderless: false
  }}
>
```
- Usa `elevation` per depth invece di shadows manuali
- Ripple effect al posto di scale animation
- Corner radius 12dp (Material medium)

---

## 5. **Bottom Sheet Detail Screen**

```typescript
// Stack navigation - Android style
presentation: 'modal',
animation: 'slide_from_bottom',

// Oppure usa Modal Bottom Sheet nativo
import { BottomSheetModal } from '@gorhom/bottom-sheet';

<BottomSheetModal
  snapPoints={['50%', '90%']}
  handleIndicatorStyle={{
    backgroundColor: colors.textSecondary,
    width: 32,
    height: 4,
  }}
>
```
- Handle indicator visibile in alto (drag handle)
- Snap points multipli per espansione progressiva
- Gesture di swipe down per chiudere

---

## 6. **FAB e Action Buttons**

```typescript
// Sostituisci i blur buttons con FAB Material
<FAB
  icon="close"
  style={{
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.surface,
    elevation: 4,
  }}
  onPress={() => navigation.goBack()}
/>

// Action buttons con Material filled/outlined style
<Button
  mode="contained"           // Filled button
  buttonColor={colors.primary}
  textColor={colors.background}
>
  Watchlist
</Button>

<Button
  mode="outlined"            // Outlined button
  textColor={colors.primary}
>
  Watched
</Button>
```

---

## 7. **Haptic Feedback → Vibration**

```typescript
import { Vibration, Platform } from 'react-native';

const triggerFeedback = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate(10);  // Short vibration
  }
};

// Oppure usa react-native-haptic-feedback per più controllo
import HapticFeedback from 'react-native-haptic-feedback';
HapticFeedback.trigger('impactLight');
```
- Android usa Vibration API
- Durate più corte (10-50ms) per feedback sottile

---

## 8. **Press States con Ripple**

```typescript
// Sostituisci opacity/scale con Material Ripple
<Pressable
  android_ripple={{
    color: 'rgba(187, 134, 252, 0.3)',  // Primary color con alpha
    borderless: false,
    foreground: true,
  }}
  style={({ pressed }) => [
    styles.container,
    // NO scale transform su Android
  ]}
>
```
- Ripple effect è lo standard Material
- `foreground: true` per ripple sopra il contenuto
- Colore ripple basato sul primary color

---

## 9. **Collection Cards**

```typescript
// CollectionCard.tsx - Material style
containerStyle: {
  borderRadius: 16,           // Material large radius
  elevation: 1,
  backgroundColor: colors.surfaceVariant,
}

// Gradient più sottile
<LinearGradient
  colors={[`${color}20`, colors.surface]}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
>
```
- Elevation invece di shadows custom
- Border radius più grandi (16dp)
- Gradienti più sottili

---

## 10. **Pull-to-Refresh**

```typescript
<RefreshControl
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
  colors={[colors.primary]}           // Spinner color (Android)
  progressBackgroundColor={colors.surface}
/>
```
- Usa `colors` array invece di `tintColor`
- `progressBackgroundColor` per lo sfondo dello spinner

---

## 11. **Status Bar & Navigation Bar**

```typescript
import { StatusBar } from 'expo-status-bar';

// App.tsx
<>
  <StatusBar style="light" backgroundColor={colors.background} />
  <NavigationContainer>
    ...
  </NavigationContainer>
</>

// Per edge-to-edge display (Android 10+)
// In app.json è già abilitato: "edgeToEdgeEnabled": true
```
- Colora la status bar per match con l'app
- Edge-to-edge per display immersivo

---

## 12. **Image Loading**

```typescript
<Image
  source={{ uri: posterUrl }}
  contentFit="cover"
  transition={300}              // Leggermente più lungo
  placeholder={require('./placeholder.png')}  // Placeholder image
/>
```
- Transition leggermente più lunga (300ms)
- Usa placeholder image invece di colore

---

## 13. **Chips per Filtri (Material Chips)**

```typescript
// SearchScreen.tsx - Material Filter Chips
import { Chip } from 'react-native-paper';

<Chip
  mode="outlined"
  selected={searchType === 'movies'}
  onPress={() => setSearchType('movies')}
  selectedColor={colors.primary}
  style={{ marginRight: 8 }}
>
  Movies
</Chip>
```
- Usa Material Chips invece di pill buttons custom
- `mode="outlined"` per filter chips
- Checkmark automatico quando selezionato

---

## 14. **Rating Display**

```typescript
// Material style rating badges
<Surface style={{ padding: 12, borderRadius: 8, elevation: 1 }}>
  <Text style={styles.ratingLabel}>IMDb</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialIcons name="star" size={18} color={colors.imdbYellow} />
    <Text style={styles.ratingValue}>8.5</Text>
  </View>
</Surface>
```
- Usa `Surface` component per elevation
- Material Icons invece di Ionicons dove possibile

---

## 15. **Snackbar per Feedback**

```typescript
// Invece di alert/toast custom, usa Material Snackbar
import { Snackbar } from 'react-native-paper';

<Snackbar
  visible={showSnackbar}
  onDismiss={() => setShowSnackbar(false)}
  duration={3000}
  action={{
    label: 'Undo',
    onPress: () => handleUndo(),
  }}
>
  Added to Watchlist
</Snackbar>
```
- Snackbar dal basso per azioni confermate
- Action button per undo

---

## Librerie Consigliate per Android

```json
{
  "react-native-paper": "^5.x",      // Material Design 3 components
  "@gorhom/bottom-sheet": "^4.x",    // Native bottom sheets
  "react-native-haptic-feedback": "^2.x",  // Haptic/vibration
  "@react-native-material/core": "^1.x"    // Alternative MD components
}
```

---

## Differenze Chiave iOS vs Android

| Feature | iOS | Android |
|---------|-----|---------|
| Blur effects | ✅ BlurView | ❌ Usa elevation |
| Press feedback | Scale + opacity | Ripple effect |
| Navigation | Modal slide up | Bottom sheet |
| Buttons | Pill-shaped | Rounded rectangle |
| Typography | SF Pro | Roboto |
| Shadows | Custom shadows | Elevation system |
| Haptics | expo-haptics | Vibration API |
| Tab bar | Blur background | Solid + elevation |
| Corner radius | 20dp (large) | 12-16dp (medium) |

---

## Implementazione Condizionale

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  card: {
    borderRadius: Platform.select({ ios: 20, android: 12 }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

// Conditional component rendering
{Platform.OS === 'ios' ? (
  <BlurView intensity={80} style={styles.tabBar} />
) : (
  <View style={[styles.tabBar, { backgroundColor: colors.surface }]} />
)}
```
