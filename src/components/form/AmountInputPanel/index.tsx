import { rgba } from 'polished'
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'
import ReactTooltip from 'react-tooltip'

import { unwrapMessage } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { ChainId, getTokenDisplay } from '../../../utils'
import { MiniInfoIcon } from '../../icons/MiniInfoIcon'
import { MiniLock } from '../../icons/MiniLock'
import { MiniSpinner } from '../../icons/MiniSpinner'
import {
  FieldRowBottom,
  FieldRowInfo,
  FieldRowInfoProps,
  FieldRowInput,
  FieldRowLabel,
  FieldRowPrimaryButton,
  FieldRowPrimaryButtonText,
  FieldRowToken,
  FieldRowTokenSymbol,
  FieldRowTop,
  FieldRowWrapper,
  InfoType,
} from '../../pureStyledComponents/FieldRow'
import TokenLogo from '../../token/TokenLogo'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const UnlockButton = styled(FieldRowPrimaryButton)<{ unlocking?: boolean }>`
  background-color: ${(props) =>
    props.unlocking ? '#008c73' : ({ theme }) => theme.buttonPrimary.backgroundColor};
  color: ${(props) => (props.unlocking ? '#fff' : ({ theme }) => theme.buttonPrimary.color)};
  height: 17px;

  &:hover {
    background-color: ${(props) =>
      props.unlocking
        ? rgba('#008c73', 0.8)
        : ({ theme }) => rgba(theme.buttonPrimary.backgroundColor, 0.8)};
    color: ${(props) => (props.unlocking ? '#fff' : ({ theme }) => theme.buttonPrimary.color)};
  }

  &[disabled] {
    background-color: ${(props) =>
      props.unlocking ? '#008c73' : ({ theme }) => theme.buttonPrimary.backgroundColor};
    opacity: 1;
  }
`

UnlockButton.defaultProps = {
  unlocking: false,
}

const SpinningLaVidaLoca = styled.span`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
  margin-right: 2px;
`

const Balance = styled.div<{ disabled?: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 20px;
  ${(props) => props.disabled && 'opacity: 0.7;'}
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const Wrap = styled.div`
  display: flex;
  flex-grow: 0;
  align-items: center;
`

Balance.defaultProps = {
  disabled: false,
}

interface unlockProps {
  isLocked: boolean
  onUnlock: () => void
  unlockState: ApprovalState
}

interface wrapProps {
  isWrappable: boolean
  onClick: () => void
}

interface Props {
  balance?: string
  balanceString?: string
  chainId: ChainId
  info?: FieldRowInfoProps
  onMax?: () => void
  onUserSellAmountInput: (val: string) => void
  token: Maybe<Token>
  unlock: unlockProps
  wrap: wrapProps
  value: string
}

const AmountInputPanel: React.FC<Props> = (props) => {
  const {
    balance,
    balanceString,
    chainId,
    info,
    onMax,
    onUserSellAmountInput,
    token = null,
    unlock,
    value,
    wrap,
    ...restProps
  } = props
  const [readonly, setReadonly] = useState(true)
  const { account } = useActiveWeb3React()
  const isUnlocking = unlock.unlockState === ApprovalState.PENDING
  const error = info?.type === InfoType.error
  const dataTip = unwrapMessage[chainId]

  return (
    <>
      <FieldRowInfo infoType={info?.type}>
        {info && (
          <>
            <MiniInfoIcon /> {info.text}
          </>
        )}
      </FieldRowInfo>
      <FieldRowWrapper
        error={error}
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottomWidth: 0.5,
        }}
        {...restProps}
      >
        <FieldRowTop>
          <FieldRowInput
            disabled={!account}
            hasError={error}
            onBlur={() => setReadonly(true)}
            onFocus={() => setReadonly(false)}
            onUserSellAmountInput={onUserSellAmountInput}
            readOnly={readonly}
            value={value}
          />
          <Wrap>
            {token && (
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#222222] rounded-full p-1">
                {token.address && (
                  <TokenLogo
                    size={'16px'}
                    token={{ address: token.address, symbol: token.symbol }}
                  />
                )}
                {token && token.symbol && (
                  <FieldRowTokenSymbol>{getTokenDisplay(token, chainId)}</FieldRowTokenSymbol>
                )}
              </FieldRowToken>
            )}
            {unlock.isLocked && (
              <UnlockButton
                disabled={isUnlocking}
                onClick={unlock.onUnlock}
                unlocking={isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <SpinningLaVidaLoca>
                      <MiniSpinner />
                    </SpinningLaVidaLoca>
                    <FieldRowPrimaryButtonText>Unlocking</FieldRowPrimaryButtonText>
                  </>
                ) : (
                  <>
                    <MiniLock />
                    <FieldRowPrimaryButtonText>Unlock</FieldRowPrimaryButtonText>
                  </>
                )}
              </UnlockButton>
            )}
            {wrap.isWrappable && (
              <FieldRowPrimaryButton
                className={`tooltipComponent`}
                data-for={'wrap_button'}
                data-html={true}
                data-multiline={true}
                data-tip={dataTip}
                onClick={wrap.onClick}
              >
                <ReactTooltip
                  arrowColor={'#001429'}
                  backgroundColor={'#001429'}
                  border
                  borderColor={'#174172'}
                  className="customTooltip"
                  delayHide={50}
                  delayShow={250}
                  effect="solid"
                  id={'wrap_button'}
                  textColor="#fff"
                />
                <FieldRowPrimaryButtonText>Unwrap</FieldRowPrimaryButtonText>
              </FieldRowPrimaryButton>
            )}
          </Wrap>
        </FieldRowTop>
        <FieldRowBottom>
          <FieldRowLabel>Amount</FieldRowLabel>
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default AmountInputPanel
