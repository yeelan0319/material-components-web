/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

import MDCComponent from '@material/base/component';

import MDCChipSetAdapter from './adapter';
import MDCChipSetFoundation from './foundation';
import {MDCChip, MDCChipFoundation} from '../chip';

/**
 * @extends {MDCComponent<!MDCChipSetFoundation>}
 * @final
 */
class MDCChipSet extends MDCComponent {
  /**
   * @param {...?} args
   */
  constructor(...args) {
    super(...args);
    /** @private {!Array<!Element>} */
    this.chips_;
    /** @private {function(!Event): undefined} */
    this.chipInteractionHandler_;
  }

  /**
   * @param {!Element} root
   * @return {!MDCChipSet}
   */
  static attachTo(root) {
    return new MDCChipSet(root);
  }

  /**
   * @return {!Array<!MDCChip>}
   */
  get chips() {
    return this.chips_;
  }

  /**
   * @return {!Array<string>}
   */
  get selectedValues() {
    return this.foundation_.getSelectedChipValues();
  }

  // TODO: add ability to add chip at index
  addChip(content) {
    const chipEl = bel `
      <div class="demo-chip mdc-chip mdc-chip--with-leading-icon mdc-chip--with-trailing-icon">
        <i class="material-icons mdc-chip__icon" tabindex="0">face</i>
        <span class=".mdc-chip__text">${content}</span>
        <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing mdc-chip__icon--close" tabindex="0">cancel</i>
      </div>
    `;
    const chip = new MDCChip(chipEl);

    this.foundation_.addChip(chipEl);
    this.chips_.push(chip);
  }

  removeChip(index) {
    this.chips_[index].exit();
  }

  initialize(chipFactory = (el) => new MDCChip(el)) {
    this.chips_ = this.instantiateChips_(chipFactory);
    this.chipInteractionHandler_ = (evt) => this.foundation_.handleChipInteraction(evt);
    this.chipAnimationEndHandler_ = (evt) => this.foundation_.handleChipAnimationEnd(evt);
  }

  /**
   * @return {!MDCChipSetFoundation}
   */
  getDefaultFoundation() {
    return new MDCChipSetFoundation(/** @type {!MDCChipSetAdapter} */ (Object.assign({
      hasClass: (className) => this.root_.classList.contains(className),
      attachChip: (chipEl) => this.root_.appendChild(chipEl),
      deleteChip: (chipEl) => this.root_.removeChild(chipEl),
      // TODO(bonniez): figure out how to use registerInteractionHandler instead
      bindOnChipInteractionEvent: () => this.listen(
        MDCChipFoundation.strings.INTERACTION_EVENT, this.chipInteractionHandler_),
      unbindOnChipInteractionEvent: () => this.unlisten(
        MDCChipFoundation.strings.INTERACTION_EVENT, this.chipInteractionHandler_),
      bindOnChipAnimationEndEvent: () => this.listen(
        MDCChipFoundation.strings.ANIMATION_END_EVENT, this.chipAnimationEndHandler_),
      unbindOnChipAnimationEndEvent: () => this.unlisten(
        MDCChipFoundation.strings.ANIMATION_END_EVENT, this.chipAnimationEndHandler_),
      // registerInteractionHandler: (evtType, handler) => this.listen(evtType, handler),
      // deregisterInteractionHandler: (evtType, handler) => this.listen(evtType, handler),
    })));
  }

  instantiateChips_(chipFactory) {
    const chipElements = [].slice.call(this.root_.querySelectorAll(MDCChipSetFoundation.strings.CHIP_SELECTOR));
    return chipElements.map((el) => chipFactory(el));
  }
}

export {MDCChipSet, MDCChipSetFoundation};
