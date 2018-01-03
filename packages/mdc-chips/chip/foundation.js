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

import MDCFoundation from '@material/base/foundation';
import {MDCChipAdapter} from './adapter';


/**
 * @extends {MDCFoundation<!MDCChipAdapter>}
 * @final
 */
class MDCChipFoundation extends MDCFoundation {

  /**
   * {@see MDCChipAdapter} for typing information on parameters and return
   * types.
   * @return {!MDCChipAdapter}
   */
  static get defaultAdapter() {
    return /** @type {!MDCChipAdapter} */ ({
      addClass: () => {},
      removeClass: () => {},
      registerInteractionHandler: () => {},
      deregisterInteractionHandler: () => {},
    });
  }

  /**
   * @param {!MDCChipAdapter=} adapter
   */
  constructor(adapter = /** @type {!MDCChipAdapter} */ ({})) {
    super(Object.assign(MDCChipFoundation.defaultAdapter, adapter));

    /** @private {boolean} */
    this.selected_ = false;

    /** @private {function(!Event): undefined} */
    this.interactionHandler_ = (evt) => this.handleInteraction(evt);
  }

  init() {
    ['click', 'keydown'].forEach((evtType) => {
      this.adapter_.registerInteractionHandler(evtType, this.interactionHandler_);
    });
  }

  destroy() {
    ['click', 'keydown'].forEach((evtType) => {
      this.adapter_.deregisterInteractionHandler(evtType, this.interactionHandler_);
    });
  }

  /**
   * Handles an interaction event
   * @param {!Event} evt
   */
  handleInteraction(evt) {
    if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
      this.toggleSelected_();
    }
  }

  toggleSelected_() {
    if (this.selected_) {
      this.adapter_.removeClass('mdc-chip--selected');
    } else {
      this.adapter_.addClass('mdc-chip--selected');
    }
    this.selected_ = !this.selected_;
  }
}

export default MDCChipFoundation;
