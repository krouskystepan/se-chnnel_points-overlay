## 🎛️ Channel Points Timery – README / Návod

Tento overlay umožňuje správu **více nezávislých timerů**, které se zobrazují při aktivaci Channel Points odměn. Navíc můžeš přes příkazy (chat commands) ovládat timery ručně – např. je spustit, pozastavit nebo přidat nový.

---

### 🧩 Přehled nastavení (`fieldData`)

| Klíč                     | Význam                                      |
| ------------------------ | ------------------------------------------- |
| `reward_1` až `reward_5` | Definice odměn napojených na Channel Points |
| `createTimer`            | Chat command pro vytvoření nového timeru    |
| `pauseTimer`             | Chat command pro pauzu jednoho timeru       |
| `unpauseTimer`           | Chat command pro spuštění jednoho timeru    |
| `pauseAllTimers`         | Chat command pro pauzu všech timerů         |
| `unpauseAllTimers`       | Chat command pro spuštění všech timerů      |
| `deleteTimer`            | Chat command pro resetování timeru          |
| `privileges`             | Kdo může ovládat timery přes commandy       |
| `timerAlign`             | Umístění timerů na overlayi                 |
| `volume`                 | Hlasitost zvuku po dokončení timeru         |

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

Přidá nový timer do overlaye a spustí ho.

**Příklad:**

```
!ccptimer Break:Pause Mode:900
```

> Vytvoří a spustí timer „Break“ s ID „Pause Mode“ na 15 minut (900 sekund).

---

### 🔹 2. Pauznout jeden konkrétní timer

```
!pcptimer <název>
```

Pozastaví běžící timer s daným názvem.

**Příklad:**

```
!pcptimer Zastavit čas
```

> Pozastaví timer s ID „Zastavit čas“.

---

### 🔹 3. Spustit znovu jeden konkrétní timer

```
!upcptimer <název>
```

Spustí timer s daným názvem.

**Příklad:**

```
!upcptimer Zastavit čas
```

> Spustí timer „Zastavit čas“.

---

### 🔹 4. Pauznout všechny timery

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

### 🔹 6. Resetovat (smazat) timer

```
!dcptimer <název>
```

Resetuje daný timer s daným názvem na nulu a skryje ho v overlayi (neodstraňuje ho z DOM).

**Příklad:**

```
!dcptimer Zastavit čas
```

> Smaže timer „Zastavit čas“ z overlaye.

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

## 🎨 Umístění timeru (`timerAlign`)

Timer wrapper bude zarovnán podle vybrané možnosti:

- `start` – Levá / Horní strana
- `center` – Na střed (výchozí)
- `end` – Pravá / Dolní strana

> **Poznámka:** Toto zarovnání se použije jak pro horizontální (`justify-content`), tak i vertikální (`align-items`) osu, tedy obsah bude zarovnán zároveň horizontálně i vertikálně podle zvolené hodnoty.

---

## 🔊 Zvuk při konci timeru

- Hlasitost ovládáš sliderem `volume` (0.0 – 1.0)
- Při doběhnutí timeru se přehraje zvuk (`#sound`)
