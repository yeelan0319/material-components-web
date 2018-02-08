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
import {cssClasses, strings, numbers} from './constants';
import MDCFoundation from '../mdc-base/foundation';

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
    this.isShort = false;
    this.alwaysClosed = false;
    this.isScrolled = false;

    this.boundShortScroll = this.shortAppBarScrollHandler.bind(this);
    this.boundTopScroll = this.topAppBarScrollHandler.bind(this);

    this.setAppBarType(this.adapter_.hasClass('mdc-top-app-bar--short'));
  }

  setAppBarType(isShort) {
    this.isShort = isShort;
    this.totalIcons = document.getElementsByClassName('mdc-top-app-bar__icon').length;
    this.alwaysClosed = this.adapter_.hasClass('mdc-top-app-bar--short-closed');
    this.isScrolled = this.alwaysClosed;

    if (this.isShort) {
      if (this.totalIcons > 0) {
        this.adapter_.addClass('mdc-top-app-bar--short__double-icon');
      }
      this.adapter_.registerScrollHandler(this.boundShortScroll);
      this.adapter_.deregisterScrollHandler(this.boundTopScroll);

    } else {
      this.adapter_.deregisterScrollHandler(this.boundShortScroll);
      this.adapter_.registerScrollHandler(this.boundTopScroll);
    }

  }

  destroy() {
    this.adapter_.deregisterScrollHandler(this.boundShortScroll);
    this.adapter_.deregisterScrollHandler(this.boundTopScroll);
  }

  shortAppBarScrollHandler() {
    if (window.scrollY === 0 && this.isScrolled) {
      this.adapter_.removeClass('mdc-top-app-bar--short-closed');
      this.isScrolled = false;
    } else if (!this.isScrolled && window.scrollY > 0) {
      this.adapter_.addClass('mdc-top-app-bar--short-closed');
      this.isScrolled = true;
    }
  }

  topAppBarScrollHandler() {
    if (window.scrollY === 0 && this.isScrolled) {
      this.adapter_.removeClass('mdc-top-app-bar--scrolled');
      this.isScrolled = false;
    } else if (!this.isScrolled && window.scrollY > 0) {
      this.adapter_.addClass('mdc-top-app-bar--scrolled');
      this.isScrolled = true;
    }
  }

  topAppBarResizeHandler() {
    // const totalSpace = this.totalIcons * 48;
    //
    // if (totalSpace > this.iconSection.getWidth()) {
    //
    // }
  }
}
