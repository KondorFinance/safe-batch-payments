import { Grid } from "@mui/material";

import { CSVDownload } from "./CSVDownload";
import { CSVUpload } from "./CSVUpload";

export interface CSVFormProps {}

export const CSVForm = (props: CSVFormProps): JSX.Element => {
  return (
    <>
      <Grid mt={3} container direction="row">
        <Grid item pr={1} md={6} display="flex" alignItems="flex-start">
          <CSVUpload />
        </Grid>
        <Grid item pl={1} md={6} display="flex" alignItems="flex-end">
          <CSVDownload />
        </Grid>
      </Grid>
    </>
  );
};
