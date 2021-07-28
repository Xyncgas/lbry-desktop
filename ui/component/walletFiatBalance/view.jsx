// @flow
import * as ICONS from 'constants/icons';
import * as MODALS from 'constants/modal_types';
import * as PAGES from 'constants/pages';
import React from 'react';
import CreditAmount from 'component/common/credit-amount';
import Button from 'component/button';
import HelpLink from 'component/common/help-link';
import Card from 'component/common/card';
import Icon from 'component/common/icon';
import LbcSymbol from 'component/common/lbc-symbol';
import I18nMessage from 'component/i18nMessage';
import { formatNumberWithCommas } from 'util/number';

type Props = {
  balance: number,
  totalBalance: number,
  claimsBalance: number,
  supportsBalance: number,
  tipsBalance: number,
  doOpenModal: (string) => void,
  hasSynced: boolean,
  doFetchUtxoCounts: () => void,
  doUtxoConsolidate: () => void,
  fetchingUtxoCounts: boolean,
  consolidatingUtxos: boolean,
  consolidateIsPending: boolean,
  massClaimingTips: boolean,
  massClaimIsPending: boolean,
  utxoCounts: { [string]: number },
  accountDetails: any,
};

export const WALLET_CONSOLIDATE_UTXOS = 400;
const LARGE_WALLET_BALANCE = 100;

const WalletBalance = (props: Props) => {
  const {
    balance,
    claimsBalance,
    supportsBalance,
    tipsBalance,
    doOpenModal,
    hasSynced,
    doUtxoConsolidate,
    doFetchUtxoCounts,
    consolidatingUtxos,
    consolidateIsPending,
    massClaimingTips,
    massClaimIsPending,
    utxoCounts,
    accountDetails,
  } = props;

  console.log('account details');
  console.log(accountDetails);

  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const { other: otherCount = 0 } = utxoCounts || {};

  const totalBalance = balance + tipsBalance + supportsBalance + claimsBalance;
  const totalLocked = tipsBalance + claimsBalance + supportsBalance;
  const operationPending = massClaimIsPending || massClaimingTips || consolidateIsPending || consolidatingUtxos;

  React.useEffect(() => {
    if (balance > LARGE_WALLET_BALANCE && detailsExpanded) {
      doFetchUtxoCounts();
    }
  }, [doFetchUtxoCounts, balance, detailsExpanded]);

  return (
    <Card
      title={<><Icon size="18" icon={ICONS.FINANCE} />313 USD</>}
      subtitle={
        totalLocked > 0 ? (
          <I18nMessage>
            This is your remaining balance that can still be withdrawn to your bank account
          </I18nMessage>
        ) : (
          <span>{__('Your total balance.')}</span>
        )
      }
      actions={
        <>
          <h2 className="section__title--small">
            ${accountDetails && accountDetails.total_tipped / 100 } Received Total
          </h2>

          <h2 className="section__title--small">
            $100 Withdrawn
            <Button
              button="link"
              label={detailsExpanded ? __('View less') : __('View more')}
              iconRight={detailsExpanded ? ICONS.UP : ICONS.DOWN}
              onClick={() => setDetailsExpanded(!detailsExpanded)}
            />
          </h2>
          {detailsExpanded && (
            <div className="section__subtitle">
              <dl>
                <dt>
                  <span className="dt__text">{__('...earned from others')}</span>
                  <span className="help--dt">({__('Unlock to spend')})</span>
                </dt>
                <dd>
                  <span className="dd__text">
                    {Boolean(tipsBalance) && (
                      <Button
                        button="link"
                        className="dd__button"
                        disabled={operationPending}
                        icon={ICONS.UNLOCK}
                        onClick={() => doOpenModal(MODALS.MASS_TIP_UNLOCK)}
                      />
                    )}
                    <CreditAmount amount={tipsBalance} precision={4} />
                  </span>
                </dd>

                <dt>
                  <span className="dt__text">{__('...on initial publishes')}</span>
                  <span className="help--dt">({__('Delete or edit past content to spend')})</span>
                </dt>
                <dd>
                  <CreditAmount amount={claimsBalance} precision={4} />
                </dd>

                <dt>
                  <span className="dt__text">{__('...supporting content')}</span>
                  <span className="help--dt">({__('Delete supports to spend')})</span>
                </dt>
                <dd>
                  <CreditAmount amount={supportsBalance} precision={4} />
                </dd>
              </dl>
            </div>
          )}

          {/* @if TARGET='app' */}
          {hasSynced ? (
            <p className="section help">
              {__('A backup of your wallet is synced with lbry.tv.')}
              <HelpLink href="https://lbry.com/faq/account-sync" />
            </p>
          ) : (
            <p className="help--warning">
              {__('Your wallet is not currently synced with lbry.tv. You are in control of backing up your wallet.')}
              <HelpLink navigate={`/$/${PAGES.BACKUP}`} />
            </p>
          )}
          {/* @endif */}
          <div className="section__actions">
            <Button button="primary" label={__('Receive Payout')} icon={ICONS.SEND} navigate={`/$/${PAGES.SEND}`} />
            <Button button="secondary" label={__('Account Configuration')} icon={ICONS.SETTINGS} navigate={`/$/${PAGES.SEND}`} />
          </div>
          {(otherCount > WALLET_CONSOLIDATE_UTXOS || consolidateIsPending || consolidatingUtxos) && (
            <p className="help">
              <I18nMessage
                tokens={{
                  now: (
                    <Button
                      button="link"
                      onClick={() => doUtxoConsolidate()}
                      disabled={operationPending}
                      label={
                        consolidateIsPending || consolidatingUtxos ? __('Consolidating...') : __('Consolidate Now')
                      }
                    />
                  ),
                  help: <HelpLink href="https://lbry.com/faq/transaction-types" />,
                }}
              >
                Your wallet has a lot of change lying around. Consolidating will speed up your transactions. This could
                take some time. %now%%help%
              </I18nMessage>
            </p>
          )}
        </>
      }
    />
  );
};

export default WalletBalance;
