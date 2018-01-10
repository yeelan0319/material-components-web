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
/* eslint-enable no-unused-vars */
import {cssClasses, strings} from './constants';


/**
 * @extends {MDCFoundation<!MDCChipAdapter>}
 * @final
 */
class MDCChipFoundation extends MDCFoundation {
  /** @return enum {string} */
  static get cssClasses() {
    return cssClasses;
  }

  /** @return enum {string} */
  static get strings() {
    return strings;
  }

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
    /** @private {function(!Event): undefined} */
    this.exitHandler_ = (evt) => this.handleExit(evt);
    /** @private {function(!Event): undefined} */
    this.transitionEndHandler_ = (evt) => this.handleTransitionEnd(evt);
  }

  init() {
    ['click', 'keydown'].forEach((evtType) => {
      this.adapter_.registerInteractionHandler(evtType, this.interactionHandler_);
      this.adapter_.registerExitHandler(evtType, this.exitHandler_);
    });
    this.adapter_.registerInteractionHandler('transitionend', this.transitionEndHandler_);
  }

  destroy() {
    ['click', 'keydown'].forEach((evtType) => {
      this.adapter_.deregisterInteractionHandler(evtType, this.interactionHandler_);
      this.adapter_.deregisterExitHandler(evtType, this.exitHandler_);
    });
    this.adapter_.deregisterInteractionHandler('transitionend', this.transitionEndHandler_);
  }

  /**
   * Handles an interaction event
   * @param {!Event} evt
   */
  handleInteraction(evt) {
    if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
      this.adapter_.notifyInteraction();
    }
  }

  /**
   * Handles an interaction event
   * @param {!Event} evt
   */
  handleExit(evt) {
    if (evt.type === 'click' || evt.key === 'Enter' || evt.keyCode === 13) {
      this.adapter_.addClass(cssClasses.EXIT);
    }
  }

  /**
   * Handles an interaction event
   * @param {!Event} evt
   */
  handleTransitionEnd(evt) {
    // TODO: === ?
    if (evt.propertyName == 'opacity') {
      this.adapter_.removeClass(cssClasses.EXIT);
      this.adapter_.notifyAnimationEnd();
    }
  }

  toggleSelected() {
    if (this.selected_) {
      this.adapter_.removeClass('mdc-chip--selected');
    } else {
      this.adapter_.addClass('mdc-chip--selected');
    }
    this.selected_ = !this.selected_;
    this.adapter_.notifySelectionChange();
  }

  notifyAction() {
    this.adapter_.notifyAction();
  }

  getText() {
    return this.adapter_.getText();
  }
}

export default MDCChipFoundation;
