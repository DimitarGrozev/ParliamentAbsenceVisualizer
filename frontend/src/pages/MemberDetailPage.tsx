import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppContext } from '../context/AppContext';
import { useMemberProfile } from '../hooks/useMemberProfile';
import { aggregateAbsencesByMember, getMemberInitials } from '../utils/aggregations';
import { format, parseISO } from 'date-fns';
import { bg } from 'date-fns/locale';

/**
 * Safely formats a date string, returning a fallback if the date is invalid
 */
function formatDateSafe(dateString: string | null | undefined, fallback: string = 'N/A'): string {
  if (!dateString || dateString.trim() === '') {
    return fallback;
  }
  try {
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: bg });
  } catch {
    return fallback;
  }
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Member detail page component
 * Displays comprehensive information about a parliament member including:
 * - Absence history
 * - Municipalities
 * - Memberships in political structures
 * - Proposed laws
 * - Questions to ministers
 * - Legislative amendments
 */
export default function MemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { allAbsences, loading: absencesLoading, error: absencesError } = useAppContext();
  const { profile, loading: profileLoading, error: profileError } = useMemberProfile(memberId);
  const [imageError, setImageError] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Filter absences for this specific member and aggregate
  const memberData = useMemo(() => {
    if (!memberId || !allAbsences.length) return null;

    const memberAbsences = allAbsences.filter(
      (a) => a.A_ns_MP_id === Number(memberId)
    );

    if (memberAbsences.length === 0) return null;

    const aggregated = aggregateAbsencesByMember(memberAbsences);
    return aggregated[0];
  }, [memberId, allAbsences]);

  // Calculate absence statistics
  const statistics = useMemo(() => {
    if (!memberData) return null;

    const dates = memberData.absences.map((a) => new Date(a.MP_Ab_date));
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Find most common location
    const locationCounts = memberData.absences.reduce((acc, absence) => {
      const location = absence.A_ns_CL_value;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonLocation = Object.entries(locationCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    return {
      totalAbsences: memberData.absenceCount,
      earliestDate,
      latestDate,
      mostCommonLocation,
    };
  }, [memberData]);

  // Sort absences by date (most recent first)
  const sortedAbsences = useMemo(() => {
    if (!memberData) return [];
    return [...memberData.absences].sort(
      (a, b) => new Date(b.MP_Ab_date).getTime() - new Date(a.MP_Ab_date).getTime()
    );
  }, [memberData]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loading = absencesLoading || profileLoading;
  const error = absencesError || profileError;

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading member data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Member not found
  if (!memberData) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Member not found or has no data.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      {/* Member Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            {/* Member Photo */}
            {!imageError ? (
              <Box
                component="img"
                src={memberData.memberImageUrl}
                alt={memberData.fullName}
                onError={handleImageError}
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: 2,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {getMemberInitials(memberData)}
              </Avatar>
            )}

            {/* Member Details */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {memberData.fullName}
              </Typography>
              <Chip
                label={memberData.partyShortName || memberData.partyName}
                color="primary"
                sx={{ mb: 2 }}
              />

              {/* Additional profile info if available */}
              {profile && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {profile.A_ns_MP_Email && (
                    <Typography variant="body2" color="text.secondary">
                      Email: {profile.A_ns_MP_Email}
                    </Typography>
                  )}
                  {profile.A_ns_Va_name && (
                    <Typography variant="body2" color="text.secondary">
                      Electoral District: {profile.A_ns_Va_name}
                    </Typography>
                  )}
                  {profile.A_ns_B_City && (
                    <Typography variant="body2" color="text.secondary">
                      Birth City: {profile.A_ns_B_City}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {statistics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Absence Statistics
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Absences
                </Typography>
                <Typography variant="h5" color="error.main">
                  {statistics.totalAbsences}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Period
                </Typography>
                <Typography variant="body1">
                  {format(statistics.earliestDate, 'dd MMM yyyy', { locale: bg })} -{' '}
                  {format(statistics.latestDate, 'dd MMM yyyy', { locale: bg })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Most Common Location
                </Typography>
                <Typography variant="body1">{statistics.mostCommonLocation}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Tabs Section */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="member data tabs">
              <Tab label={`Absences (${sortedAbsences.length})`} />
              <Tab label={`Municipalities (${profile?.munList.length || 0})`} />
              <Tab label={`Memberships (${profile?.mshipList.length || 0})`} />
              <Tab label={`Proposed Laws (${profile?.importActList.length || 0})`} />
              <Tab label={`Questions (${profile?.controlList.length || 0})`} />
              <Tab label={`Amendments (${profile?.legImportList.length || 0})`} />
            </Tabs>
          </Box>

          {/* Tab 0: Absence History */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell align="center"><strong>Type</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAbsences.map((absence) => (
                    <TableRow key={absence.MP_Ab_id}>
                      <TableCell>
                        {format(new Date(absence.MP_Ab_date), 'dd MMM yyyy', { locale: bg })}
                      </TableCell>
                      <TableCell>{absence.A_ns_CL_value}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={absence.MP_Ab_T_id === 1 ? 'Type 1' : 'Type 2'}
                          size="small"
                          color={absence.MP_Ab_T_id === 1 ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 1: Municipalities */}
          <TabPanel value={tabValue} index={1}>
            {profile && profile.munList.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Municipality ID</strong></TableCell>
                      <TableCell><strong>Municipality Name</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.munList.map((mun) => (
                      <TableRow key={mun.A_ns_Va_M_id}>
                        <TableCell>{mun.A_ns_Va_M_id}</TableCell>
                        <TableCell>{mun.A_ns_Va_M_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No municipality data available</Typography>
            )}
          </TabPanel>

          {/* Tab 2: Memberships */}
          <TabPanel value={tabValue} index={2}>
            {profile && profile.mshipList.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Organization</strong></TableCell>
                      <TableCell><strong>Position</strong></TableCell>
                      <TableCell><strong>From</strong></TableCell>
                      <TableCell><strong>To</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.mshipList.map((mship, index) => (
                      <TableRow key={mship.A_ns_MSP_id || index}>
                        <TableCell>{mship.A_ns_CL_value || 'N/A'}</TableCell>
                        <TableCell>{mship.A_ns_MP_PosL_value || 'N/A'}</TableCell>
                        <TableCell>
                          {formatDateSafe(mship.A_ns_MSP_date_F)}
                        </TableCell>
                        <TableCell>
                          {mship.A_ns_MSP_date_T === '9999-12-31'
                            ? 'Present'
                            : formatDateSafe(mship.A_ns_MSP_date_T)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No membership data available</Typography>
            )}
          </TabPanel>

          {/* Tab 3: Proposed Laws */}
          <TabPanel value={tabValue} index={3}>
            {profile && profile.importActList.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Sign</strong></TableCell>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Proposal Period</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.importActList.map((act) => (
                      <TableRow key={act.L_Act_id}>
                        <TableCell>{act.L_Act_sign}</TableCell>
                        <TableCell>{act.L_ActL_title}</TableCell>
                        <TableCell>
                          {formatDateSafe(act.L_Act_date)}
                        </TableCell>
                        <TableCell>
                          {formatDateSafe(act.L_act_proposal_date)} -{' '}
                          {formatDateSafe(act.L_act_proposal_date2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No proposed laws data available</Typography>
            )}
          </TabPanel>

          {/* Tab 4: Questions to Ministers */}
          <TabPanel value={tabValue} index={4}>
            {profile && profile.controlList.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>To</strong></TableCell>
                      <TableCell><strong>Subject</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.controlList.map((question) => (
                      <TableRow key={question.ID}>
                        <TableCell>
                          {formatDateSafe(question.DATE_DOC)}
                        </TableCell>
                        <TableCell>
                          {question.A_ns_MPL_Name1} ({question.A_ns_MP_PosL_value})
                        </TableCell>
                        <TableCell>{question.ANOT}</TableCell>
                        <TableCell>
                          <Chip label={question.typeCl} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No questions data available</Typography>
            )}
          </TabPanel>

          {/* Tab 5: Legislative Amendments */}
          <TabPanel value={tabValue} index={5}>
            {profile && profile.legImportList.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Document Number</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.legImportList.map((amendment) => (
                      <TableRow key={amendment.ID}>
                        <TableCell>{amendment.RN_DOC}</TableCell>
                        <TableCell>
                          {formatDateSafe(amendment.DAT_DOC)}
                        </TableCell>
                        <TableCell>{amendment.ANOT}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No amendments data available</Typography>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
