/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
'use strict';

const React = require('React');
const StyleSheet = require('StyleSheet');

const requireNativeComponent = require('requireNativeComponent');
const nullthrows = require('nullthrows');
const setAndForwardRef = require('setAndForwardRef');

import type {ViewProps} from 'ViewPropTypes';
import type {SyntheticEvent} from 'CoreEventTypes';
import type {NativeComponent} from 'ReactNative';

type CheckBoxEvent = SyntheticEvent<
  $ReadOnly<{|
    target: number,
    value: boolean,
  |}>,
>;

type CommonProps = $ReadOnly<{|
  ...ViewProps,

  /**
   * Used in case the props change removes the component.
   */
  onChange?: ?(event: CheckBoxEvent) => mixed,

  /**
   * Invoked with the new value when the value changes.
   */
  onValueChange?: ?(value: boolean) => mixed,

  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: ?string,
|}>;

type NativeProps = $ReadOnly<{|
  ...CommonProps,

  on?: ?boolean,
  enabled?: boolean,
|}>;

type CheckBoxNativeType = Class<NativeComponent<NativeProps>>;

type Props = $ReadOnly<{|
  ...CommonProps,

  /**
   * The value of the checkbox.  If true the checkbox will be turned on.
   * Default value is false.
   */
  value?: ?boolean,

  /**
   * If true the user won't be able to toggle the checkbox.
   * Default value is false.
   */
  disabled?: ?boolean,

  /**
   * Used to get the ref for the native checkbox
   */
  forwardedRef?: ?React.Ref<CheckBoxNativeType>,
|}>;

const RCTCheckBox = ((requireNativeComponent(
  'AndroidCheckBox',
): any): CheckBoxNativeType);

/**
 * Renders a boolean input (Android only).
 *
 * This is a controlled component that requires an `onValueChange` callback that
 * updates the `value` prop in order for the component to reflect user actions.
 * If the `value` prop is not updated, the component will continue to render
 * the supplied `value` prop instead of the expected result of any user actions.
 *
 * ```
 * import React from 'react';
 * import { AppRegistry, StyleSheet, Text, View, CheckBox } from 'react-native';
 *
 * export default class App extends React.Component {
 *   constructor(props) {
 *     super(props);
 *     this.state = {
 *       checked: false
 *     }
 *   }
 *
 *   toggle() {
 *     this.setState(({checked}) => {
 *       return {
 *         checked: !checked
 *       };
 *     });
 *   }
 *
 *   render() {
 *     const {checked} = this.state;
 *     return (
 *       <View style={styles.container}>
 *         <Text>Checked</Text>
 *         <CheckBox value={checked} onChange={this.toggle.bind(this)} />
 *       </View>
 *     );
 *   }
 * }
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     flexDirection: 'row',
 *     alignItems: 'center',
 *     justifyContent: 'center',
 *   },
 * });
 *
 * // skip this line if using Create React Native App
 * AppRegistry.registerComponent('App', () => App);
 * ```
 *
 * @keyword checkbox
 * @keyword toggle
 */
class CheckBox extends React.Component<Props> {
  _nativeRef: ?React.ElementRef<CheckBoxNativeType> = null;
  _setNativeRef = setAndForwardRef({
    getForwardedRef: () => this.props.forwardedRef,
    setLocalRef: ref => {
      this._nativeRef = ref;
    },
  });

  _onChange = (event: CheckBoxEvent) => {
    const value = this.props.value ?? false;
    nullthrows(this._nativeRef).setNativeProps({value: value});
    // Change the props after the native props are set in case the props
    // change removes the component
    this.props.onChange && this.props.onChange(event);
    this.props.onValueChange &&
      this.props.onValueChange(event.nativeEvent.value);
  };

  render() {
    const {disabled: _, value: __, style, forwardedRef, ...props} = this.props;
    const disabled = this.props.disabled ?? false;
    const value = this.props.value ?? false;

    const nativeProps = {
      ...props,
      onStartShouldSetResponder: () => true,
      onResponderTerminationRequest: () => false,
      enabled: !disabled,
      on: value,
      style: [styles.rctCheckBox, style],
    };

    return (
      <RCTCheckBox
        {...nativeProps}
        ref={this._setNativeRef}
        onChange={this._onChange}
      />
    );
  }
}

const styles = StyleSheet.create({
  rctCheckBox: {
    height: 32,
    width: 32,
  },
});

/**
 * Can't use CheckBoxNativeType because it has different props
 */
type CheckBoxType = Class<NativeComponent<Props>>;

const CheckBoxWithRef = React.forwardRef(function CheckBoxWithRef(props, ref) {
  return <CheckBox {...props} forwardedRef={ref} />;
});

/* $FlowFixMe(>=0.89.0 site=react_native_android_fb) This comment suppresses an
 * error found when Flow v0.89 was deployed. To see the error, delete this
 * comment and run Flow. */
module.exports = (CheckBoxWithRef: CheckBoxType);
