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

import MDCChipAdapter from './adapter';
import MDCChipFoundation from './foundation';
import {strings, cssClasses} from './constants';

/**
 * @extends {MDCComponent<!MDCChipFoundation>}
 * @final
 */
class MDCChip extends MDCComponent {
  /**
   * @param {...?} args
   */
  constructor(...args) {
    super(...args);
    /** @private {?Element} */
    this.textEl_;
    /** @private {?Element} */
    this.closeEl_;
  }

  /**
   * @param {!Element} root
   * @return {!MDCChip}
   */
  static attachTo(root) {
    return new MDCChip(root);
  }

  initialize() {
    this.textEl_ = this.root_.querySelector(cssClasses.TEXT_SELECTOR);
    this.closeEl_ = this.root_.querySelector(cssClasses.CLOSE_ICON_SELECTOR);
  }
  
  /**
   * @return {string}
   */
  get text() {
    return this.foundation_.getText();
  }

  setLeadingIcon(iconEl) {
    this.foundation_.setLeadingIcon(iconEl);
  }

  // TODO: consolidate this into setLeadingIcon?
  removeLeadingIcon(){
    this.foundation_.removeLeadingIcon();
  }

  toggleSelected() {
    this.foundation_.toggleSelected();
  }

  exit() {
    this.foundation_.exit();
  }

  /**
   * @return {!MDCChipFoundation}
   */
  getDefaultFoundation() {
    return new MDCChipFoundation(/** @type {!MDCChipAdapter} */ (Object.assign({
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      hasClass: (className) => this.root_.classList.contains(className),
      registerInteractionHandler: (evtType, handler) => this.root_.addEventListener(evtType, handler),
      deregisterInteractionHandler: (evtType, handler) => this.root_.removeEventListener(evtType, handler),
      registerCloseHandler: (evtType, handler) => {
        if (this.closeEl_) {
          this.closeEl_.addEventListener(evtType, handler);
        }
      },
      deregisterCloseHandler: (evtType, handler) => {
        if (this.closeEl_) {
          this.closeEl_.removeEventListener(evtType, handler);
        }
      },
      notifyInteraction: () => this.emit(
        MDCChipFoundation.strings.INTERACTION_EVENT, {chip: this}, true /* shouldBubble */),
      notifyAnimationEnd: () => this.emit(MDCChipFoundation.strings.ANIMATION_END_EVENT, {chipEl: this.root_}, true /* shouldBubble */),
      getText: () => this.textEl_.textContent,
      insertLeadingIcon: (iconEl) => this.root_.insertBefore(iconEl, this.root_.firstChild),
      removeLeadingIcon: () => {
        if (this.root_.classList.contains(cssClasses.WITH_LEADING_ICON)) {
          this.root_.removeChild(this.root_.firstElementChild);
        }
      },
    })));
  }
}

export {MDCChip, MDCChipFoundation};
