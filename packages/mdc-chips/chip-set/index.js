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
    /** @private {string} */
    this.type_;
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
   * @return {!Array<!Element>}
   */
  get chips() {
    return this.chips_;
  }

  /**
   * @return {!Array<string>}
   */
  get selected() {
    return this.foundation_.getSelectedChipValues();
  }

  initialize(chipFactory = (el) => new MDCChip(el)) {
    this.chips_ = this.createChips_(chipFactory);
    this.chipInteractionHandler_ = (evtData) => this.foundation_.handleChipInteraction(evtData);
  }

  /**
   * @return {!MDCChipSetFoundation}
   */
  getDefaultFoundation() {
    return new MDCChipSetFoundation(/** @type {!MDCChipSetAdapter} */ (Object.assign({
      hasClass: (className) => this.root_.classList.contains(className),

      // TODO(bonniez): figure out how to use registerInteractionHandler instead
      bindOnChipInteractionEvent: () => this.listen(
        MDCChipFoundation.strings.INTERACTION_EVENT, this.chipInteractionHandler_),
      unbindOnChipInteractionEvent: () => this.unlisten(
        MDCChipFoundation.strings.INTERACTION_EVENT, this.chipInteractionHandler_),
      // registerInteractionHandler: (evtType, handler) => this.listen(evtType, handler),
      // deregisterInteractionHandler: (evtType, handler) => this.listen(evtType, handler),
    })));
  }

  createChips_(chipFactory) {
    const chipElements = [].slice.call(this.root_.querySelectorAll(MDCChipSetFoundation.strings.CHIP_SELECTOR));
    return chipElements.map((el) => chipFactory(el));
  }

}

export {MDCChipSet, MDCChipSetFoundation};
