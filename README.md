# JS FH Player

(wip)

## Contents
1. [Assets File Format Description](#1-assets-file-format-description)
   * 1.1. [Version Control](#11-version-control)
   * 1.2. [General Format Syntax](#12-general-format-syntax)
   * 1.3. [Music File Format](#13-music-file-format)
   * 1.4. [Beatmap File Format](#14-beatmap-file-format)
   * 1.5. [Hitsound File Format](#15-hitsound-file-format)
   * 1.6. [Video File Format](#16-video-file-format)
   * 1.7. [Skin File Format](#17-skin-file-format)
   * 1.8. [Settings File Format](#18-settings-file-format)
   * 1.9. [Collection File Format](#19-collection-file-format)
1. [Test](#2-test)

## 1. Assets File Format Description

### 1.1. Version Control

**Latest experimental version: 1**  
(modification of the format might still occur)

**Latest released version: n/a**  
(modification is guaranteed to never happen)

The following documentation refers to the version 1 of this asset file format.

### 1.2. General Format Syntax

Each asset is expected to be a plain text file containing a valid JSON structure.

These objects must be formated this way:

```JSON
{
  "metadata": {
    "version": 1,
    "type": {String Object}
  },
  "data": {Object}
}
```

The asset metadata.type field is expected to be one included from the following list (case sensitive):
- music
- beatmap
- hitsound
- video
- skin
- settings
- collection

### 1.3. Music File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "music",
    "name": {String Object},
    "author": {String Object}
  },
  "data": {String Object}
}
```

### 1.4. Beatmap File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "beatmap",
    "name": {String Object},
    "music_name": {String Object}
  },
  "data": {
    "beats": {Array of Numbers},
    "loops": {Array of Numbers},
    "cuts": {Array of Numbers}
  }
}
```

### 1.5. Hitsound File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "hitsound"
  },
  "data": {String Object}
}
```

### 1.6. Video File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "video",
    "source": {String Object},
    "characters": {Array of String Objects},
    "name": {String Object},
    "tags": {Array of String Objects},
    "phase_shift": {Number},
    "thumbnail": {String Object}
  },
  "data": {Array of String Objects}
}
```

### 1.7. Skin File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "skin",
    "range": [{Number}, {Number}],
    "progress_range": [{Number}, {Number}],
    "height": {Number}
  },
  "data": {Array of Skin Element Objects}
}
```

```JSON
{
  "layer": {String Object},
  "left": [{String Object}, {Number}],
  "right": [{String Object}, {Number}],
  "center": {Number},
  "top": {Number},
  "range": [{Number}, {Number}],
  "scaling": {String Object},
  "animation": {String Object},
  "framerate": {Number},
  "img": {String Object or Array of String Objects}
}
```

### 1.8. Settings File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "settings",
  },
  "data": {
    "beatbar_position": {Number},
    "beatbar_length": {Number},
    "t0_position": {Number},
    "music_volume": {Number},
    "hitsound_volume": {Number},
    "time_offset": {Number}
  }
}
```

### 1.9. Collection File Format

```JSON
{
  "metadata": {
    "version": 1,
    "type": "collection",
  },
  "data": {Array of Asset Objects}
}
```

## 2. Test

(wip)
