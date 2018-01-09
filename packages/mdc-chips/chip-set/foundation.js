/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MDCFoundation from '@material/base/foundation';
import MDCChipSetAdapter from './adapter';
import {strings, cssClasses} from './constants';


/**
 * @extends {MDCFoundation<!MDCChipSetAdapter>}
 * @final
 */
class MDCChipSetFoundation extends MDCFoundation {
  /** @return enum {string} */
  static get strings() {
    return strings;
  }

  /** @return enum {string} */
  static get cssClasses() {
    return cssClasses;
  }

  /**
   * {@see MDCChipSetAdapter} for typing information on parameters and return
   * types.
   * @return {!MDCChipSetAdapter}
   */
  static get defaultAdapter() {
    return /** @type {!MDCChipSetAdapter} */ ({
      hasClass: () => {},
      bindOnChipInteractionEvent: () => {},
      unbindOnChipInteractionEvent: () => {},
      // registerInteractionHandler: () => {},
      // deregisterInteractionHandler: () => {},
    });
  }

  /**
   * @param {!MDCChipSetAdapter=} adapter
   */
  constructor(adapter = /** @type {!MDCChipSetAdapter} */ ({})) {
    super(Object.assign(MDCChipSetFoundation.defaultAdapter, adapter));

    /** @private {!Array<!MDCChip>} */
    this.selectedChips_ = [];
    // /** @private {function(!Event): undefined} */
    // this.chipInteractionHandler = (evtData) => this.handleChipInteraction(evtData);
  }

  init() {
    this.adapter_.bindOnChipInteractionEvent();
    // this.adapter_.registerInteractionHandler(strings.CHIP_INTERACTION_EVENT, this.chipInteractionHandler_);
  }

  destroy() {
    this.adapter_.unbindOnChipInteractionEvent();
    // this.adapter_.deregisterInteractionHandler(strings.CHIP_INTERACTION_EVENT, this.chipInteractionHandler_);
  }

  /**
   * Handles a chip interaction event
   * @param {!Object} evtData
   */
  handleChipInteraction(evtData) {
    const targetChip = evtData.target;
    if (this.adapter_.hasClass(cssClasses.ENTRY)) {
      // do nothing, INTERACTION_EVENT can be captured by client for expanding into a card??
    } else if (this.adapter_.hasClass(cssClasses.CHOICE)) {
      if (this.selectedChips_[0] != targetChip) {
        this.selectedChips_[0].toggleSelected();
        this.selectedChips_[0] = targetChip;
      } else {
        this.selectedChips_ = [];
      }
      targetChip.toggleSelected();
    } else if (this.adapter_.hasClass(cssClasses.FILTER)) {
      
    } else if (this.adapter_.hasClass(cssClasses.ACTION)) {
      
    }
  }

  getSelectedChipValues() {
    return this.selectedChips_.map((chip) => chip.text);
  }
}

export default MDCChipSetFoundation;
