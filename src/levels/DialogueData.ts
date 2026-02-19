import { LEVEL_6_DIALOGUE } from './level6-data';
import { LEVEL_7_DIALOGUE } from './level7-data';
import { LEVEL_8_DIALOGUE } from './level8-data';
import { LEVEL_9_DIALOGUE } from './level9-data';
import { LEVEL_10_DIALOGUE } from './level10-data';
import { LEVEL_11_DIALOGUE } from './level11-data';
import { LEVEL_12_DIALOGUE } from './level12-data';
import { LEVEL_13_DIALOGUE } from './level13-data';
import { LEVEL_14_DIALOGUE } from './level14-data';
import { LEVEL_15_DIALOGUE } from './level15-data';

export interface DialogueLine {
  speaker: string;
  portrait: string;
  text: string;
}

export interface LevelDialogue {
  pre: DialogueLine[];
  mid?: DialogueLine[];
  midTriggerTurn?: number;
  post: DialogueLine[];
}

const LEVEL_DIALOGUE: Record<number, LevelDialogue> = {
  1: {
    pre: [
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Squad Ember, this is your first real mission. Stay sharp and move as one.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'Archers ready. I will keep eyes on every flank.'
      },
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'I am with you all the way. No one falls today.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Advance and hold formation. Show them what Ember tactics means.'
      }
    ],
    post: [
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Well fought, squad. Discipline won us this field.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'Not bad for our first live engagement.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Catch your breath. Harder battles are waiting.'
      }
    ]
  },
  2: {
    pre: [
      {
        speaker: 'Scout Elena',
        portrait: 'elena',
        text: 'Movement in the trees. This forest is an ambush waiting to happen.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Then we force them out, one pocket at a time.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'River to the east, thick brush to the west. Watch your lanes.'
      },
      {
        speaker: 'Scout Elena',
        portrait: 'elena',
        text: 'Bridge is narrow. If we get split, we are done.'
      }
    ],
    post: [
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'That was close. The forest swallowed sound and sight.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'We survived because everyone covered each other.'
      },
      {
        speaker: 'Scout Elena',
        portrait: 'elena',
        text: 'You earned your reputation today.'
      }
    ]
  },
  3: {
    pre: [
      {
        speaker: 'Merchant Galen',
        portrait: 'galen',
        text: 'Please, I beg you. I must cross Ashvale Bridge before nightfall.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Stay behind our shield line and do exactly as we say.'
      },
      {
        speaker: 'Merchant Galen',
        portrait: 'galen',
        text: 'I will. Just get me through alive.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'Enemies are already setting up on the far bank.'
      }
    ],
    midTriggerTurn: 3,
    mid: [
      {
        speaker: 'Merchant Galen',
        portrait: 'galen',
        text: 'They are breaking through! We cannot hold much longer!'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Hold the bridge. Galen moves now, with escort.'
      }
    ],
    post: [
      {
        speaker: 'Merchant Galen',
        portrait: 'galen',
        text: 'You saved my life and my livelihood. I owe you everything.'
      },
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'You are safe. That is enough for us.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Mission complete. Move out before more arrive.'
      }
    ]
  },
  4: {
    pre: [
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'It is too quiet... this village should not be silent.'
      },
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'Fires are still burning. Someone was here moments ago.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Weapons up. We move street by street.'
      },
      {
        speaker: 'Shade',
        portrait: 'shade',
        text: 'Eyes on the alleys. I do not trust this calm.'
      }
    ],
    midTriggerTurn: 3,
    mid: [
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'They flanked us! Reinforcements from the east!'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Pivot formation. Break the flank before they surround us.'
      }
    ],
    post: [
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'We made it... I can finally breathe again.'
      },
      {
        speaker: 'Shade',
        portrait: 'shade',
        text: 'Barely. But we held when it mattered.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Take the win. We march at dawn.'
      }
    ]
  },
  5: {
    pre: [
      {
        speaker: 'Ember King',
        portrait: 'ember_king',
        text: 'So the little sparks finally reach my throne.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Your reign ends tonight. Stand down and face judgment.'
      },
      {
        speaker: 'Ember King',
        portrait: 'ember_king',
        text: 'Judgment? I forged this kingdom in fire.'
      },
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'Then we douse that fire right here.'
      },
      {
        speaker: 'Ember King',
        portrait: 'ember_king',
        text: 'Come then. Burn with the rest.'
      }
    ],
    midTriggerTurn: 4,
    mid: [
      {
        speaker: 'Ember King',
        portrait: 'ember_king',
        text: 'Half my strength is still more than enough!'
      },
      {
        speaker: 'Ember King',
        portrait: 'ember_king',
        text: 'Kneel, and I may leave you ashes to crawl from.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'He is enraged. Do not break formation now.'
      }
    ],
    post: [
      {
        speaker: 'Lyra',
        portrait: 'lyra',
        text: 'It is over. The Ember King has fallen.'
      },
      {
        speaker: 'Mira',
        portrait: 'mira',
        text: 'The fires are fading... the kingdom can heal.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Every one of you fought like legends today.'
      },
      {
        speaker: 'Commander Aldric',
        portrait: 'aldric',
        text: 'Return home. Ember Tactics is victorious.'
      }
    ]
  },
  6: LEVEL_6_DIALOGUE as LevelDialogue,
  7: LEVEL_7_DIALOGUE as LevelDialogue,
  8: LEVEL_8_DIALOGUE as LevelDialogue,
  9: LEVEL_9_DIALOGUE as LevelDialogue,
  10: LEVEL_10_DIALOGUE as LevelDialogue,
  11: LEVEL_11_DIALOGUE as LevelDialogue,
  12: LEVEL_12_DIALOGUE as LevelDialogue,
  13: LEVEL_13_DIALOGUE as LevelDialogue,
  14: LEVEL_14_DIALOGUE as LevelDialogue,
  15: LEVEL_15_DIALOGUE as LevelDialogue
};

export function getLevelDialogue(levelId: number): LevelDialogue {
  return LEVEL_DIALOGUE[levelId] ?? LEVEL_DIALOGUE[1];
}
