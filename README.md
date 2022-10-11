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

the asset metadata.type field is expected to be one included from the following list (case sensitive):
- music
- beatmap
- hitsound
- video
- skin
- settings
- collection

### 1.3. Music File Format

(wip)

### 1.4. Beatmap File Format

(wip)

### 1.5. Hitsound File Format

(wip)

### 1.6. Video File Format

(wip)

### 1.7. Skin File Format

(wip)

### 1.8. Settings File Format

(wip)

### 1.9. Collection File Format

(wip)

## 2. Test

(wip)
