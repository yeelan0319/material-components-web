/**
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
import {cssClasses, strings, numbers} from './constants';

export default class MDCTopAppBarFoundation extends MDCFoundation {
  static get cssClasses() {
    return cssClasses;
  }

  static get strings() {
    return strings;
  }

  static get numbers() {
    return numbers;
  }

  static get defaultAdapter() {
    return {
      hasClass: (/* className: string */) => /* boolean */ false,
      addClass: (/* className: string */) => {},
      removeClass: (/* className: string */) => {},
      registerScrollHandler: (/* handler: EventListener */) => {},
      deregisterScrollHandler: (/* handler: EventListener */) => {},
      registerResizeHandler: (/* handler: EventListener */) => {},
      deregisterResizeHandler: (/* handler: EventListener */) => {},
      getViewportWidth: () => /* number */ 0,
      getViewportScrollY: () => /* number */ 0,
      getOffsetHeight: () => /* number */ 0,
      getFirstRowElementOffsetHeight: () => /* number */ 0,
      notifyChange: (/* evtData: {flexibleExpansionRatio: number} */) => {},
      setStyle: (/* property: string, value: string */) => {},
      setStyleForTitleElement: (/* property: string, value: string */) => {},
      setStyleForFlexibleRowElement: (/* property: string, value: string */) => {},
      setStyleForFixedAdjustElement: (/* property: string, value: string */) => {},
    };
  }

  constructor(adapter) {
    super(Object.assign(MDCTopAppBarFoundation.defaultAdapter, adapter));
    this.resizeHandler_ = () => this.checkRowHeight_();
    this.scrollHandler_ = () => this.updateTopAppBarStyles_();
    this.checkRowHeightFrame_ = 0;
    this.scrollFrame_ = 0;
    this.executedLastChange_ = false;

    this.calculations_ = {
      barRowHeight: 0,
      // Calculated Height ratio. We use ratio to calculate corresponding heights in resize event.
      barRatio: 0, // The ratio of bar height to row height
      flexibleExpansionRatio: 0, // The ratio of flexible space height to row height
      maxTranslateYRatio: 0, // The ratio of max bar move up distance to row height
      scrollThresholdRatio: 0, // The ratio of max scrollTop that we should listen to to row height
      // Derived Heights based on the above key ratios.
      barHeight: 0,
      flexibleExpansionHeight: 0, // Flexible row minus bar height (derived)
      maxTranslateYDistance: 0, // When bar only fix last row (derived)
      scrollThreshold: 0,
    };
    // TopAppBar fixed behavior
    // If bar is fixed
    this.fixed_ = false;
    // If fixed is targeted only at the last row
    this.fixedLastrow_ = false;
    // TopAppBar flexible behavior
    // If the first row is flexible
    this.hasFlexibleRow_ = false;
    // If use the default behavior
    this.useFlexDefaultBehavior_ = false;
  }

  init() {
    this.fixed_ = this.adapter_.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED);
    this.fixedLastrow_ = this.adapter_.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_LASTROW) & this.fixed_;
    this.hasFlexibleRow_ = this.adapter_.hasClass(MDCTopAppBarFoundation.cssClasses.TOPAPPBAR_ROW_FLEXIBLE);
    if (this.hasFlexibleRow_) {
      this.useFlexDefaultBehavior_ = this.adapter_.hasClass(MDCTopAppBarFoundation.cssClasses.FLEXIBLE_DEFAULT_BEHAVIOR);
    }
    this.initKeyRatio_();
    this.setKeyHeights_();
    this.adapter_.registerResizeHandler(this.resizeHandler_);
    this.adapter_.registerScrollHandler(this.scrollHandler_);
  }

  destroy() {
    this.adapter_.deregisterResizeHandler(this.resizeHandler_);
    this.adapter_.deregisterScrollHandler(this.scrollHandler_);
  }

  updateAdjustElementStyles() {
    if (this.fixed_) {
      this.adapter_.setStyleForFixedAdjustElement('margin-top', `${this.calculations_.barHeight}px`);
    }
  }

  getFlexibleExpansionRatio_(scrollTop) {
    // To prevent division by zero when there is no flexibleExpansionHeight
    const delta = 0.0001;
    return Math.max(0, 1 - scrollTop / (this.calculations_.flexibleExpansionHeight + delta));
  }

  checkRowHeight_() {
    cancelAnimationFrame(this.checkRowHeightFrame_);
    this.checkRowHeightFrame_ = requestAnimationFrame(() => this.setKeyHeights_());
  }

  setKeyHeights_() {
    const newTopAppBarRowHeight = this.getRowHeight_();
    if (newTopAppBarRowHeight !== this.calculations_.barRowHeight) {
      this.calculations_.barRowHeight = newTopAppBarRowHeight;
      this.calculations_.barHeight = this.calculations_.barRatio * this.calculations_.barRowHeight;
      this.calculations_.flexibleExpansionHeight =
        this.calculations_.flexibleExpansionRatio * this.calculations_.barRowHeight;
      this.calculations_.maxTranslateYDistance =
        this.calculations_.maxTranslateYRatio * this.calculations_.barRowHeight;
      this.calculations_.scrollThreshold =
        this.calculations_.scrollThresholdRatio * this.calculations_.barRowHeight;
      this.updateAdjustElementStyles();
      this.updateTopAppBarStyles_();
    }
  }

  updateTopAppBarStyles_() {
    cancelAnimationFrame(this.scrollFrame_);
    this.scrollFrame_ = requestAnimationFrame(() => {
      const scrollTop = this.adapter_.getViewportScrollY();
      const hasScrolledOutOfThreshold = this.scrolledOutOfThreshold_(scrollTop);

      if (hasScrolledOutOfThreshold && this.executedLastChange_) {
        return;
      }

      const flexibleExpansionRatio = this.getFlexibleExpansionRatio_(scrollTop);

      this.updateTopAppBarFlexibleState_(flexibleExpansionRatio);
      if (this.fixedLastrow_) {
        this.updateTopAppBarFixedState_(scrollTop);
      }
      if (this.hasFlexibleRow_) {
        this.updateFlexibleRowElementStyles_(flexibleExpansionRatio);
      }
      this.executedLastChange_ = hasScrolledOutOfThreshold;
      this.adapter_.notifyChange({flexibleExpansionRatio: flexibleExpansionRatio});
    });
  }

  scrolledOutOfThreshold_(scrollTop) {
    return scrollTop > this.calculations_.scrollThreshold;
  }

  initKeyRatio_() {
    const barRowHeight = this.getRowHeight_();
    const firstRowMaxRatio = this.adapter_.getFirstRowElementOffsetHeight() / barRowHeight;
    this.calculations_.barRatio = this.adapter_.getOffsetHeight() / barRowHeight;
    this.calculations_.flexibleExpansionRatio = firstRowMaxRatio - 1;
    this.calculations_.maxTranslateYRatio =
      this.fixedLastrow_ ? this.calculations_.barRatio - firstRowMaxRatio : 0;
    this.calculations_.scrollThresholdRatio =
      (this.fixedLastrow_ ? this.calculations_.barRatio : firstRowMaxRatio) - 1;
  }

  getRowHeight_() {
    const breakpoint = MDCTopAppBarFoundation.numbers.TOPAPPBAR_MOBILE_BREAKPOINT;
    return this.adapter_.getViewportWidth() < breakpoint ?
      MDCTopAppBarFoundation.numbers.TOPAPPBAR_ROW_MOBILE_HEIGHT : MDCTopAppBarFoundation.numbers.TOPAPPBAR_ROW_HEIGHT;
  }

  updateTopAppBarFlexibleState_(flexibleExpansionRatio) {
    this.adapter_.removeClass(MDCTopAppBarFoundation.cssClasses.FLEXIBLE_MAX);
    this.adapter_.removeClass(MDCTopAppBarFoundation.cssClasses.FLEXIBLE_MIN);
    if (flexibleExpansionRatio === 1) {
      this.adapter_.addClass(MDCTopAppBarFoundation.cssClasses.FLEXIBLE_MAX);
    } else if (flexibleExpansionRatio === 0) {
      this.adapter_.addClass(MDCTopAppBarFoundation.cssClasses.FLEXIBLE_MIN);
    }
  }

  updateTopAppBarFixedState_(scrollTop) {
    const translateDistance = Math.max(0, Math.min(
      scrollTop - this.calculations_.flexibleExpansionHeight,
      this.calculations_.maxTranslateYDistance));
    this.adapter_.setStyle('transform', `translateY(${-translateDistance}px)`);

    if (translateDistance === this.calculations_.maxTranslateYDistance) {
      this.adapter_.addClass(MDCTopAppBarFoundation.cssClasses.FIXED_AT_LAST_ROW);
    } else {
      this.adapter_.removeClass(MDCTopAppBarFoundation.cssClasses.FIXED_AT_LAST_ROW);
    }
  }

  updateFlexibleRowElementStyles_(flexibleExpansionRatio) {
    if (this.fixed_) {
      const height = this.calculations_.flexibleExpansionHeight * flexibleExpansionRatio;
      this.adapter_.setStyleForFlexibleRowElement('height',
        `${height + this.calculations_.barRowHeight}px`);
    }
    if (this.useFlexDefaultBehavior_) {
      this.updateElementStylesDefaultBehavior_(flexibleExpansionRatio);
    }
  }

  updateElementStylesDefaultBehavior_(flexibleExpansionRatio) {
    const maxTitleSize = MDCTopAppBarFoundation.numbers.MAX_TITLE_SIZE;
    const minTitleSize = MDCTopAppBarFoundation.numbers.MIN_TITLE_SIZE;
    const currentTitleSize = (maxTitleSize - minTitleSize) * flexibleExpansionRatio + minTitleSize;

    this.adapter_.setStyleForTitleElement('font-size', `${currentTitleSize}rem`);
  }
}
