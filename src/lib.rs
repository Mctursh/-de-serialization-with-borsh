use solana_program::{
    msg,
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey
};

use borsh::{
    BorshSerialize,
    BorshDeserialize
};

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct GreetingAccount {
    pub counter: u32
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8]
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let account = next_account_info(account_iter)?;

    msg!("Starting Decode");

    let number_data = GreetingAccount::try_from_slice(_instruction_data).map_err(|err| {
        msg!("Receiving counter u32, {:?}", err);
        ProgramError::InvalidInstructionData
    })?;

    msg!("The number data is {:?}, counter: {}", number_data, number_data.counter);

    if account.owner != program_id {
        msg!("Greeted account does not have the program id");
        return Err(ProgramError::IncorrectProgramId)
    }

    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += number_data.counter;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Greeted {} time(s)!", greeting_account.counter);

    Ok(())
}