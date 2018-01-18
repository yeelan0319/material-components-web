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

import bel from 'bel';

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
    // this.chipInteractionHandler = (evt) => this.handleChipInteraction(evt);
  }

  init() {
    this.adapter_.bindOnChipInteractionEvent();
    this.adapter_.bindOnChipAnimationEndEvent();
    // this.adapter_.registerInteractionHandler(strings.CHIP_INTERACTION_EVENT, this.chipInteractionHandler_);
  }

  destroy() {
    this.adapter_.unbindOnChipInteractionEvent();
    this.adapter_.unbindOnChipAnimationEndEvent();
    // this.adapter_.deregisterInteractionHandler(strings.CHIP_INTERACTION_EVENT, this.chipInteractionHandler_);
  }

  getSelectedChipValues() {
    return this.selectedChips_.map((chip) => chip.text);
  }

  addChip(chipEl) {
    this.adapter_.attachChip(chipEl);
  }

  /**
   * Handles a chip interaction event
   * @param {!Object} evt
   */
  handleChipInteraction(evt) {
    const {chip} = evt.detail;
    if (this.adapter_.hasClass(cssClasses.ENTRY)) {
      // do nothing, INTERACTION_EVENT can be captured by client for expanding into a card??
    } else if (this.adapter_.hasClass(cssClasses.CHOICE)) {
      // Multi-select is prohibited for choice chips.
      if (this.selectedChips_.length == 0) {
        this.selectedChips_[0] = chip;
      } else if (this.selectedChips_[0] != chip) {
        this.selectedChips_[0].toggleSelected();
        this.selectedChips_[0] = chip;
      } else {
        this.selectedChips_ = [];
      }
      chip.toggleSelected();
    } else if (this.adapter_.hasClass(cssClasses.FILTER)) {
      const index = this.selectedChips_.indexOf(chip);
      if (index >= 0) {
        // Remove leading icon (checkmark)
        chip.removeLeadingIcon();
        // TODO: if chip has leading icon, replace it back

        this.selectedChips_.splice(index, 1);
      } else {
        // If chip doesn't have leading icon
        // TODO: maybe move this to foundation or chip logic?
        const iconEl = bel `
          <i class="material-icons mdc-chip__icon" tabindex="0">check</i>
        `;
        chip.setLeadingIcon(iconEl);
        // TODO: if chip already has leading icon, replace it

        this.selectedChips_.push(chip);
      }
      chip.toggleSelected();
    } else if (this.adapter_.hasClass(cssClasses.ACTION)) {
      // do nothing, INTERACTION_EVENT can be captured by client for triggering action
    }
  }

  /**
   * Handles a chip interaction event
   * @param {!Object} evt
   */
  handleChipAnimationEnd(evt) {
    const {chipEl} = evt.detail;
    this.adapter_.deleteChip(chipEl);
  }
}

export default MDCChipSetFoundation;
