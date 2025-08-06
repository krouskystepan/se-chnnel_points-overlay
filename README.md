## 🎛️ Channel Points Timery – README / Návod

Tento overlay umožňuje správu **více nezávislých timerů**, které se zobrazují při aktivaci Channel Points odměn. Navíc můžeš přes příkazy (chat commands) ovládat timery ručně – např. je spustit, pozastavit nebo přidat nový.

---

### 🧩 Přehled nastavení (`fieldData`)

| Klíč                                                   | Význam                                      |
| ------------------------------------------------------ | ------------------------------------------- |
| `reward_1` až `reward_5`                               | Definice odměn napojených na Channel Points |
| [createTimer](#-1-vytvořit-nový-timer-dynamicky)       | Chat command pro vytvoření nového timeru    |
| [pauseTimer](#-2-zastavit-jeden-timer)                 | Chat command pro zastavení jednoho timeru   |
| [unpauseTimer](#-3-spustit-znovu-jeden-timer)          | Chat command pro spuštění jednoho timeru    |
| [pauseAllTimers](#-4-zastavit-všechny-timery)          | Chat command pro zastavení všech timerů     |
| [unpauseAllTimers](#-5-spustit-všechny-timery)         | Chat command pro spuštění všech timerů      |
| [adjustTimer](#-6-upravit-čas-timeru)                  | Chat command pro upravování času timeru     |
| [deleteTimer](#-7-resetovat-smazat-jeden-timer)        | Chat command pro resetování jednoho timeru  |
| [deleteAllTimers](#-8-resetovat-smazat-všechny-timery) | Chat command pro resetování všech timerů    |
| [privileges](#-kdo-může-používat-commandy)             | Kdo může ovládat timery přes commandy       |
| [timerAlign](#-umístění-timeru)                        | Umístění timerů na overlayi                 |
| [volume](#-zvuk-při-konci-timeru)                      | Hlasitost zvuku po dokončení timeru         |

---

## 🔔 Odměny (Channel Points)

Každý `reward_X` definuje jeden timer:

```
VIDITELNE:JMENO ODMENY:3600
```

| Část           | Význam                                                      |
| -------------- | ----------------------------------------------------------- |
| `VIDITELNE`    | Text, který se zobrazí na overlayi (např. „Break“, „Chaos“) |
| `JMENO ODMENY` | Přesný název CP odměny z Twitchu (musí sedět přesně)        |
| `3600`         | Délka timeru v sekundách (např. 3600 = 1 hodina)            |

📝 Příklad:

```
Zatemnění:Blind Mode:600
```

---

## 💬 Chat Commands

Commandy lze volat ručně (např. když overlay restartuješ nebo chceš spustit něco bez redeemu). Jsou určeny primárně pro **moderátory nebo broadcastera** (viz `privileges`).

---

### 🔹 1. Vytvořit nový timer (dynamicky)

```
!ccptimer <VIDITELNE>:<JMENO ODMENY>:<sekundy>
```

Přidá nový timer do overlaye a spustí ho (pokud timer už existuje, tak se nic nestane => pro přidaní / odebrání času z existujícího timeru použíj jiné příkazy).

**Příklad:**

```
!ccptimer Break:Break Mode:900
```

> Vytvoří a spustí timer „Break“ s ID „Break Mode“ na 15 minut (900 sekund).

---

### 🔹 2. Zastavit jeden timer

```
!pcptimer <JMENO ODMENY>
```

Pozastaví běžící timer s daným názvem.

**Příklad:**

```
!pcptimer Break Mode
```

> Pozastaví timer s ID „Break Mode“.

---

### 🔹 3. Spustit znovu jeden timer

```
!upcptimer <JMENO ODMENY>
```

Spustí timer s daným názvem.

**Příklad:**

```
!upcptimer Break Mode
```

> Spustí timer „Break Mode“.

---

### 🔹 4. Zastavit všechny timery

```
!pcptimers
```

Pozastaví všechny běžící timery.

---

### 🔹 5. Spustit všechny timery

```
!upcptimers
```

Spustí všechny pozastavené timery.

---

### 🔹 6. Upravit čas timeru

```
!acptimer <akce>:<JMENO ODMENY>:<sekundy>
```

Umožňuje **přidat nebo odebrat čas** z existujícího timeru.
Akce může být:

- `+` → přidá čas
- `-` → odebere čas

**Příklady:**

```
!acptimer +:Break Mode:300
```

> Přidá 5 minut (300 sekund) timeru s ID „Break Mode“.

```
!acptimer -:Break Mode:60
```

> Odebere 1 minutu (60 sekund) timeru „Break Mode“.

---

### 🔹 7. Resetovat (smazat) jeden timer

```
!dcptimer <JMENO ODMENY>
```

Resetuje daný timer s daným názvem v overlayi (odstraní ho z DOM).

**Příklad:**

```
!dcptimer Break Mode
```

> Smaže timer „Break Mode“ z overlaye.

---

### 🔹 8. Resetovat (smazat) všechny timery

```
!dcptimers
```

Resetuje všechny timery v overlayi (odstraní je z DOM).

---

## 👥 Kdo může používat commandy

Pomocí `privileges` nastavíš, kdo může tyto commandy použít:

| Hodnota       | Kdo může ovládat       |
| ------------- | ---------------------- |
| `everybody`   | Všichni diváci         |
| `justSubs`    | Jen subové             |
| `subs`        | Subové, VIP a Mods     |
| `vips`        | VIP a Mods             |
| `mods`        | Jen moderátoři         |
| `broadcaster` | Pouze ty jako streamer |

---

## 🎨 Umístění timeru

Timer wrapper bude zarovnán samostatně podle horizontální a vertikální osy:

- **Horizontální umístění (`horizontalAlign`):**

  - `flex-start` – Vlevo
  - `center` – Na střed (výchozí)
  - `flex-end` – Vpravo

- **Vertikální umístění (`verticalAlign`):**

  - `flex-start` – Nahoře
  - `center` – Na střed (výchozí)
  - `flex-end` – Dole

> **Poznámka:** Zarovnání se aplikuje přes CSS vlastnosti `justify-content` (horizontálně) a `align-items` (vertikálně), takže obsah timeru bude umístěn přesně podle zvolených hodnot na obou osách.

---

## 🔊 Zvuk při konci timeru

- Hlasitost ovládáš sliderem `volume` (0.0 – 1.0)
- Při doběhnutí timeru se přehraje zvuk (`#sound`)
