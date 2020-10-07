import React, { useEffect, useState } from 'react'
import CPK from 'contract-proxy-kit'
import styled from 'styled-components'
import { Button, Card, EthHashInfo, Loader, Table, TableHeader, TableRow, Text, TextField, Title } from '@gnosis.pm/safe-react-components'
import { WalletState } from 'components/App'

const Line = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`

const TitleLine = styled.div`
  margin-right: 10px;
`

const BigLine = styled.div`
  margin: 10px 0;
`

interface SafeModulesProps {
  cpk: CPK
  walletState: WalletState
}

const SafeModules = ({ cpk, walletState }: SafeModulesProps) => {
  const [module, setModule] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [showTxError, setShowTxError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<TableRow[]>([])

  const getModules = async () => {
    const modules = await cpk.getModules()
    const rows: TableRow[] = modules.map((module, index) => ({ id: index.toString(), cells: [{ content: module }] }))
    setRows(rows)
  }

  useEffect(() => {
    getModules()
  }, [txHash])

  const enableModule = async (): Promise<void> => {
    if (!module) return
    setShowTxError(false)
    setIsLoading(true)
    try  {
      // Remove any type when TransactionResult type is updated
      const txResult: any = await cpk.enableModule(module)      
      const receipt: any = await new Promise((resolve, reject) =>
        txResult.promiEvent?.then((receipt: any) => resolve(receipt)).catch(reject)
      )
      getModules()      
    } catch(e) {
      setShowTxError(true)
    }
    setIsLoading(false)
  }

  const disableModule = async (): Promise<void> => {
    if (!module) return
    setShowTxError(false)
    setIsLoading(true)
    try {
      // Remove any type when TransactionResult type is updated
      const txResult: any = await cpk.disableModule(module)
      const receipt: any = await new Promise((resolve, reject) =>
        txResult.promiEvent?.then((receipt: any) => resolve(receipt)).catch(reject)
      )
      getModules()  
    } catch(e) {
      setShowTxError(true)
    }
    setIsLoading(false)
  }

  const headers: TableHeader[] = [{
    id: "1",
    label: "Enabled modules"
  }]

  return (
    <>
      <Title size="sm">Safe modules</Title>
      <Line>
        <TitleLine><Text size="xl">Test with this module on Rinkeby:</Text></TitleLine>
        <EthHashInfo hash="0x33A458E072b182152Bb30243f29585a82c45A22b" textSize="xl" showCopyBtn />
      </Line>
      <BigLine>
        <TextField
          id="standard-name"
          label="Module Address"
          value={module}
          onChange={(e) => setModule(e.target.value)}
        />
      </BigLine>
      <Line>
        <Button onClick={enableModule} size="md" color="primary" variant="contained">
          Enable module
        </Button>
      </Line>
      <Line>
        <Button onClick={disableModule} size="md" color="primary" variant="contained">
          Disable module
        </Button>
      </Line>
      {showTxError && (
        <Line>
          <Text size="xl" color="error">Transaction rejected</Text>
        </Line>
      )}
      {txHash && (
        <Line>
          <TitleLine><Text size="xl" as="span" strong>{walletState.isSafeApp ? 'Safe transaction hash:' : 'Transaction hash:'}</Text></TitleLine>
          <EthHashInfo hash={txHash} textSize="xl" shortenHash={8} showCopyBtn />
        </Line>
      )}
      {isLoading ? (
        <BigLine>
          <Card>
            <Loader size="sm" />
          </Card>
        </BigLine>
      ) : (
        <BigLine>
        {rows.length > 0 ? (
          <Table headers={headers} rows={rows} />
        ) : (
          <Card>
            <Text size="xl">No modules enabled</Text>
          </Card>
        )}
        </BigLine>
      )}
    </>
  )
}

export default SafeModules